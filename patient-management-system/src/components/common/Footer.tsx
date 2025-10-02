import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer>
            <p>&copy; {new Date().getFullYear()} Patient Management System. All rights reserved.</p>
            <nav>
                <a href="/privacy-policy">Privacy Policy</a>
                <a href="/terms-of-service">Terms of Service</a>
            </nav>
        </footer>
    );
};

export default Footer;