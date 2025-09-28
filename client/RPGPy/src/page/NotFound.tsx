import '../css/NotFound.css';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

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
                <a onClick={() => navigate(-1)} className="home-button">
                    Return to Previous Page
                </a>


            </div>
                
          
                
        </div>
    );
}