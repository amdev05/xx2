const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET;

if (!supabaseUrl || !supabaseKey || !supabaseBucket) {
    throw new Error('Missing Supabase configuration in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name with extension
 * @param {string} folder - Folder path (e.g., 'posters', 'trailers')
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadFile(fileBuffer, fileName, folder, contentType) {
    const filePath = `${folder}/${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
        .from(supabaseBucket)
        .upload(filePath, fileBuffer, {
            contentType,
            upsert: false
        });

    if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
        .from(supabaseBucket)
        .getPublicUrl(filePath);

    return publicData.publicUrl;
}

/**
 * Delete file from Supabase Storage
 * @param {string} fileUrl - Full public URL of the file
 * @returns {Promise<void>}
 */
async function deleteFile(fileUrl) {
    if (!fileUrl) return;

    // Extract file path from URL
    const urlParts = fileUrl.split(`/${supabaseBucket}/`);
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabase.storage
        .from(supabaseBucket)
        .remove([filePath]);

    if (error) {
        console.error('Supabase delete error:', error.message);
    }
}

module.exports = {
    supabase,
    uploadFile,
    deleteFile
};
