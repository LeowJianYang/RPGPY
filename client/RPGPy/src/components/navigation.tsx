// components/navigation.tsx

import "../css/navigation.css"

export default function NavBar(){
    return (

        <header className="navbar">
            <div className="middleNav">
                <div className="imgNav" >
                    <img src="/rpgpy-trans.png" alt="None"></img>
                </div>
                <div className="innerNav">
                    <a className="contentNav"href="/">Home</a>
                    <a className="contentNav" href="/">About</a>
                    <a className="LoginBtn" href="/Login">Login/SignUp</a>
                </div>
            </div>
        
        </header>
    )
};


export function FooterBar(){
    return (
        <footer className="footerContainer">
            <div className="innerFoot">
                <img src="/rpgpy-trans.png" alt="None"></img>
                <div className="innerCont">
                    <p className="text-title">Company Details</p>
                    <a  className="text-cont" href="/">About Us</a>
                    <a  className="text-cont" href="/">Why Choose Us ?</a>
                </div>
                <div className="innerCont">
                    <p className="text-title">How to Play ?</p>
                    <a  className="text-cont" href="/">Tutorial</a>
                    <a  className="text-cont" href="/">Legenda</a>
                </div>
            </div>
        </footer>
    )
}