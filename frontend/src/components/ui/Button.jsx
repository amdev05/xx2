export default function Button({ children, variant = "default", size = "default", classname, ...props }) {
  const variants = {
    default: "bg-light text-tx-dark ",
    dark: "bg-dark text-tx-light",
  };
  const sizes = {
    default: "px-10 py-3.5 text-sm",
    sm: "px-9 py-2 text-xs",
  };

  return (
    <button className={`rounded-full cursor-pointer  ${variants[variant]} ${sizes[size]} ${classname}`} {...props}>
      {children}
    </button>
  );
}
