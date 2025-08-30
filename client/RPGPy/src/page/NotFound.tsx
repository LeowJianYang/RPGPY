import { Link } from 'react-router-dom';
import '../css/NotFound.css';


export default function NotFoundPage() {
    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <img 
                    src="/rpgpy-trans.png"
                    alt="404 Illustration"
                    className="not-found-image"
                />
                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Page Not Found</h2>
                <p className="not-found-text">
                    Oops! The page you're looking for seems to have gone on an adventure. 
                    Let's get you back to your coding journey!
                </p>
                <Link to="/" className="home-button">
                    Return to Homepage
                </Link>
                
                
            </div>
                
          
                
        </div>
    );
}