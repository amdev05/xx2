const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all kursi by studio
 */
const getKursiByStudio = async (req, res) => {
    try {
        const { id_studio } = req.params;

        const kursis = await prisma.kursi.findMany({
            where: {
                id_studio: parseInt(id_studio)
            },
            orderBy: [
                { row_kursi: 'asc' },
                { no_kursi: 'asc' }
            ]
        });

        // Group kursi by row for easier display
        const kursiGrouped = kursis.reduce((acc, kursi) => {
            if (!acc[kursi.row_kursi]) {
                acc[kursi.row_kursi] = [];
            }
            acc[kursi.row_kursi].push(kursi);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                total: kursis.length,
                kursis: kursis,
                kursiGrouped: kursiGrouped
            }
        });
    } catch (error) {
        console.error('Error fetching kursi:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch kursi',
            error: error.message
        });
    }
};

/**
 * Create kursi massively for a studio (Admin only)
 * Supports two formats:
 * 1. Old format: rows: ['A', 'B', 'C'], seatsPerRow: 10 (uniform seats per row)
 * 2. New format: rowsConfig: {A: 30, B: 27, C: 24} (different seats per row)
 */
const createKursiMassive = async (req, res) => {
    try {
        const { id_studio, rows, seatsPerRow, rowsConfig } = req.body;

        // Check if studio exists first
        const studio = await prisma.studio.findUnique({
            where: { id_studio: parseInt(id_studio) }
        });

        if (!studio) {
            return res.status(404).json({
                success: false,
                message: 'Studio not found'
            });
        }

        let kursiData = [];
        let configSummary = {};

        // NEW FORMAT: rowsConfig object (e.g., {A: 30, B: 27, C: 24})
        if (rowsConfig && typeof rowsConfig === 'object') {
            // Validate rowsConfig
            if (Object.keys(rowsConfig).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'rowsConfig must have at least one row'
                });
            }

            // Generate kursi with different seats per row
            for (const [row, numSeats] of Object.entries(rowsConfig)) {
                const seats = parseInt(numSeats);
                if (isNaN(seats) || seats <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid number of seats for row ${row}: ${numSeats}`
                    });
                }

                for (let i = 1; i <= seats; i++) {
                    kursiData.push({
                        id_studio: parseInt(id_studio),
                        row_kursi: row.toString().toUpperCase(),
                        no_kursi: i
                    });
                }
                configSummary[row.toUpperCase()] = seats;
            }
        }
        // OLD FORMAT: rows array with uniform seatsPerRow (backward compatible)
        else if (rows && seatsPerRow) {
            // Validation
            if (!Array.isArray(rows) || rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'rows must be a non-empty array'
                });
            }

            // Generate kursi data with uniform seats
            for (const row of rows) {
                for (let i = 1; i <= seatsPerRow; i++) {
                    kursiData.push({
                        id_studio: parseInt(id_studio),
                        row_kursi: row.toString().toUpperCase(),
                        no_kursi: i
                    });
                }
                configSummary[row.toString().toUpperCase()] = seatsPerRow;
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either provide rowsConfig object or rows array with seatsPerRow'
            });
        }

        // Bulk create kursi
        const result = await prisma.kursi.createMany({
            data: kursiData,
            skipDuplicates: true
        });

        // Update studio kapasitas
        await prisma.studio.update({
            where: { id_studio: parseInt(id_studio) },
            data: {
                kapasitas_total: kursiData.length
            }
        });

        res.status(201).json({
            success: true,
            message: `${result.count} kursi created successfully`,
            data: {
                created: result.count,
                totalSeats: kursiData.length,
                configuration: configSummary
            }
        });
    } catch (error) {
        console.error('Error creating kursi:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create kursi',
            error: error.message
        });
    }
};

/**
 * Delete a single kursi (Admin only)
 */
const deleteKursi = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.kursi.delete({
            where: { id_kursi: parseInt(id) }
        });

        res.json({
            success: true,
            message: 'Kursi deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting kursi:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Kursi not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete kursi',
            error: error.message
        });
    }
};

/**
 * Delete all kursi for a studio (Admin only)
 */
const deleteAllKursiByStudio = async (req, res) => {
    try {
        const { id_studio } = req.params;

        const result = await prisma.kursi.deleteMany({
            where: { id_studio: parseInt(id_studio) }
        });

        // Update studio kapasitas to 0
        await prisma.studio.update({
            where: { id_studio: parseInt(id_studio) },
            data: { kapasitas_total: 0 }
        });

        res.json({
            success: true,
            message: `${result.count} kursi deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting kursi:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete kursi',
            error: error.message
        });
    }
};

/**
 * Update/Edit kursi configuration for a studio (Admin only)
 * Smart sync: add new rows, modify existing row counts, delete rows
 */
const updateKursiConfiguration = async (req, res) => {
    try {
        const { id_studio } = req.params;
        const { rowsConfig } = req.body;

        // Validate input
        if (!rowsConfig || typeof rowsConfig !== 'object' || Object.keys(rowsConfig).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'rowsConfig is required and must be a non-empty object'
            });
        }

        // Check if studio exists
        const studio = await prisma.studio.findUnique({
            where: { id_studio: parseInt(id_studio) }
        });

        if (!studio) {
            return res.status(404).json({
                success: false,
                message: 'Studio not found'
            });
        }

        // Get existing kursi
        const existingKursi = await prisma.kursi.findMany({
            where: { id_studio: parseInt(id_studio) },
            orderBy: [
                { row_kursi: 'asc' },
                { no_kursi: 'asc' }
            ]
        });

        // Group existing kursi by row
        const existingByRow = existingKursi.reduce((acc, kursi) => {
            if (!acc[kursi.row_kursi]) {
                acc[kursi.row_kursi] = [];
            }
            acc[kursi.row_kursi].push(kursi);
            return acc;
        }, {});

        const changes = {
            created: [],
            deleted: [],
            unchanged: []
        };

        // Process new configuration
        const newConfig = {};
        for (const [row, numSeats] of Object.entries(rowsConfig)) {
            const seats = parseInt(numSeats);
            if (isNaN(seats) || seats <= 0) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid number of seats for row ${row}: ${numSeats}`
                });
            }
            newConfig[row.toUpperCase()] = seats;
        }

        // 1. Check each row in new config
        for (const [row, newCount] of Object.entries(newConfig)) {
            const existingRow = existingByRow[row] || [];
            const existingCount = existingRow.length;

            if (existingCount === 0) {
                // NEW ROW: Create all seats
                for (let i = 1; i <= newCount; i++) {
                    changes.created.push({
                        id_studio: parseInt(id_studio),
                        row_kursi: row,
                        no_kursi: i
                    });
                }
            } else if (newCount > existingCount) {
                // ADD MORE SEATS: Create additional seats
                for (let i = existingCount + 1; i <= newCount; i++) {
                    changes.created.push({
                        id_studio: parseInt(id_studio),
                        row_kursi: row,
                        no_kursi: i
                    });
                }
                changes.unchanged.push(`${row}1-${row}${existingCount}`);
            } else if (newCount < existingCount) {
                // REMOVE SEATS: Delete seats from the end
                for (let i = newCount + 1; i <= existingCount; i++) {
                    const kursiToDelete = existingRow.find(k => k.no_kursi === i);
                    if (kursiToDelete) {
                        changes.deleted.push(kursiToDelete.id_kursi);
                    }
                }
                changes.unchanged.push(`${row}1-${row}${newCount}`);
            } else {
                // NO CHANGE
                changes.unchanged.push(`${row}1-${row}${existingCount}`);
            }
        }

        // 2. Check for rows to delete (in existing but not in new config)
        for (const [row, kursiList] of Object.entries(existingByRow)) {
            if (!newConfig[row]) {
                // DELETE ENTIRE ROW
                kursiList.forEach(kursi => {
                    changes.deleted.push(kursi.id_kursi);
                });
            }
        }

        // Execute changes in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Delete kursi
            let deletedCount = 0;
            if (changes.deleted.length > 0) {
                const deleteResult = await tx.kursi.deleteMany({
                    where: {
                        id_kursi: { in: changes.deleted }
                    }
                });
                deletedCount = deleteResult.count;
            }

            // Create kursi
            let createdCount = 0;
            if (changes.created.length > 0) {
                const createResult = await tx.kursi.createMany({
                    data: changes.created,
                    skipDuplicates: true
                });
                createdCount = createResult.count;
            }

            // Update studio capacity
            const totalSeats = Object.values(newConfig).reduce((sum, count) => sum + count, 0);
            await tx.studio.update({
                where: { id_studio: parseInt(id_studio) },
                data: { kapasitas_total: totalSeats }
            });

            return { deletedCount, createdCount, totalSeats };
        });

        res.json({
            success: true,
            message: 'Kursi configuration updated successfully',
            data: {
                created: result.createdCount,
                deleted: result.deletedCount,
                totalSeats: result.totalSeats,
                configuration: newConfig,
                summary: {
                    newRows: changes.created.length > 0 ? `Created ${result.createdCount} new seats` : null,
                    removedSeats: changes.deleted.length > 0 ? `Removed ${result.deletedCount} seats` : null,
                    unchangedRows: changes.unchanged.length > 0 ? changes.unchanged.join(', ') : null
                }
            }
        });
    } catch (error) {
        console.error('Error updating kursi configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update kursi configuration',
            error: error.message
        });
    }
};

module.exports = {
    getKursiByStudio,
    createKursiMassive,
    updateKursiConfiguration,
    deleteKursi,
    deleteAllKursiByStudio
};
