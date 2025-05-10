const Footer = () => {
    return (
        <footer className="w-full border-t px-4 py-2 text-sm text-center text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} StorageFile. All rights reserved.
        </footer>
    );
};

export default Footer;
