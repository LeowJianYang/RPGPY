import "../css/input.css";
import { motion } from "framer-motion";

const CodeIcon = () => (   <svg xmlns="http://www.w3.org/2000/svg" clipRule="evenodd" fillRule="evenodd" height="2277" strokeLinecap="square" strokeLinejoin="round" strokeMiterlimit="1.5" viewBox=".006 0 673.409 600" className="step-icon-py">
                            <path d="m.006 0h600v600h-600z" fill="none"/>
                            <g transform="translate(72.59 -63.209)">
                                <path d="m673.41 236.016-64.271 8.252v281.357h64.276z" fill="#ffca1e" stroke="#d7c5b2" strokeWidth="1.11" transform="matrix(1.02365 -.37275 .22115 .08093 -423.086 457.448)"/>
                                <path d="m609.139 244.268h64.276v281.357h-64.276z" fill="#ffd241" stroke="#d7c5b2" strokeWidth=".35" transform="matrix(3.93359 -1.43837 0 .53084 -2266.43 1087.94)"/>
                                <path d="m609.139 244.268h64.276v281.357h-64.276z" fill="#2f6490" stroke="#d1e3f2" strokeWidth=".62" transform="matrix(1.9604 -.71685 .2216 .07927 -1118.55 639.339)"/>
                                <path d="m609.139 244.268h64.276v281.357h-64.276z" fill="#3775a8" stroke="#d1e3f2" strokeWidth="1.15" transform="matrix(1.02281 -.374 0 1.05695 -430.773 214.178)"/>
                                <path d="m609.139 244.268h64.276v281.357h-64.276z" fill="#2f6490" stroke="#fff" strokeWidth="1.17" transform="matrix(-.97499 -.34924 0 1.05695 786.194 199.208)"/>
                                <path d="m609.139 244.268h64.276v281.357h-64.276z" fill="#efeeea" stroke="#d8d8d8" strokeWidth="1.44" transform="matrix(-.97499 -.35652 0 .26885 786.194 618.355)"/>
                                <g stroke="#d1e3f2">
                                    <path d="m609.139 244.268h64.276v281.357h-64.276z" fill="#2f6490" strokeWidth="1.44" transform="matrix(-.96834 -.35409 0 .53077 719.483 427.5)"/>
                                    <path d="m609.139 244.268h64.276v281.357h-64.276z" fill="#3775a8" strokeWidth="1.2" transform="matrix(.93554 -.3421 0 1.05695 -311.892 170.492)"/>
                                    <path d="m609.139 244.268h64.276v281.357h-64.276z" fill="#3775a8" strokeWidth="1.43" transform="matrix(.9742 -.35623 0 .53084 -463.744 428.761)"/>
                                    <path d="m67.575 393.161 62.121 22.465 188.708-68.299m-125.165-29.141 124.732-45.602" fill="none"/>
                                </g>
                                <path d="m318.404 347.327 63.939-23.209" fill="none" stroke="#d7c5b2"/>
                                <path d="m609.139 244.268h64.276v281.357h-64.276z" fill="#2f6490" stroke="#d1e3f2" strokeWidth="1.16" transform="matrix(.96788 -.35244 .22115 .08093 -576.168 513.583)"/>
                                <circle cx="637.517" cy="260.001" fill="#fff" r="15.71" transform="matrix(.7826 -.4024 .05494 .8614 -295.363 304.934)"/>
                                <path d="m195.786 198.125 61.696 22.126" fill="none" stroke="#d1e3f2"/>
                                <path d="m673.415 244.268h-64.276l.018 282.405 64.258-1.048z" fill="#ffd241" stroke="#d7c5b2" strokeWidth="1.37" transform="matrix(1.02281 -.374 0 .52843 -430.773 491.983)"/>
                                <path d="m673.415 244.268h-64.276l.001 281.758 64.275-.401z" fill="#ffd241" stroke="#d7c5b2" strokeWidth="1.48" transform="matrix(.93554 -.3421 0 .52743 -311.892 448.822)"/>
                                <circle cx="637.517" cy="260.001" fill="#fefdfd" r="15.71" transform="matrix(.77074 -.3963 .05156 .80832 -205.916 509.411)"/>
                                <path d="m192.412 468.059 126.028-45.977" fill="none" stroke="#d7c5b2"/>
                            </g>
                        </svg>);
const PlayIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="step-icon"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.625 3.248a1.125 1.125 0 0 1-1.688-.983V8.769a1.125 1.125 0 0 1 1.688-.983l5.625 3.248Z" clipRule="evenodd" /></svg>);
const TrophyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="step-icon"><path d="M13.5 6H15V4.128a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3V6H7.5a3 3 0 0 0-3 3v.375c0 1.621 1.332 2.943 2.95 2.994V18a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5.631A3.001 3.001 0 0 0 21 9.375V9a3 3 0 0 0-3-3H13.5ZM9 4.128c0-.377.31-.628.674-.628h1.652c.364 0 .674.251.674.628V6H9V4.128Z" /></svg>);
const PythonIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="feature-icon icon-green"><path d="M19.94 10.2a.983.983 0 0 0-.93-.76h-5.07a.983.983 0 0 1-.93-.76l-.62-2.13a.983.983 0 0 0-.93-.76h-2.92a.983.983 0 0 0-.93.76l-.62 2.13a.983.983 0 0 1-.93-.76H2.99a.983.983 0 0 0-.93.76l-.62 2.13c-.11.36.03.76.35.98l4.4 3.03c.32.22.75.22.98 0l2.12-1.46c.32-.22.75-.22.98 0l2.12 1.46c.32.22.75.22.98 0l4.4-3.03c.32-.22.46-.62.35-.98l-.62-2.13ZM12 21.75a.983.983 0 0 0 .93-.76l.62-2.13a.983.983 0 0 1 .93-.76h5.07c.4 0 .76-.23.93-.57l.62-2.13a.983.983 0 0 0-.35-.98l-4.4-3.03c-.32-.22-.75-.22-.98 0l-2.12 1.46c-.32-.22-.75-.22-.98 0L9.13 10.1c-.32-.22-.75-.22-.98 0l-4.4 3.03a.983.983 0 0 0-.35.98l.62 2.13c.11.36.44.62.84.62h5.07c.4 0 .76-.23.93.57l.62 2.13c.11.36.44.62.84.62Z" /></svg>);
const UsersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" version="1.1" id="Layer_1" width="800px" height="800px" viewBox="0 0 256 240" enableBackground="new 0 0 256 240" className="feature-icon icon-blue">
                                    <path d="M127.826,39.584c10.308,0,18.7-8.392,18.7-18.7s-8.392-18.7-18.7-18.7s-18.7,8.392-18.7,18.7S117.518,39.584,127.826,39.584  z M26.21,39.584c-10.308,0-18.7-8.392-18.7-18.7s8.392-18.7,18.7-18.7s18.7,8.392,18.7,18.7S36.518,39.584,26.21,39.584z   M229.79,39.584c10.308,0,18.7-8.392,18.7-18.7s-8.392-18.7-18.7-18.7c-10.308,0-18.7,8.392-18.7,18.7S219.482,39.584,229.79,39.584  z M253.966,130.048c0,3.167-4.598,95.372-4.598,95.372c0,6.998-5.398,12.396-12.396,12.396c-6.998,0-12.396-5.398-12.396-12.396  c0,0-8.617-95.972-10.995-131.806l-19.741,23.724c-1.694,2.035-4.194,3.192-6.808,3.192c-0.339,0-0.68-0.019-1.021-0.059  c-2.972-0.345-5.569-2.165-6.905-4.842l-23.665-47.388v156.056c0,7.435-5.504,13.517-12.359,13.517  c-6.855,0-12.359-6.082-12.359-13.517V138.85c0-1.352-1.159-2.511-2.511-2.511c-1.352,0-2.511,1.159-2.511,2.511v85.448  c0,7.435-5.504,13.517-12.359,13.517c-6.855,0-12.359-6.082-12.359-13.517V67.387l-24.092,48.243  c-1.336,2.677-3.933,4.497-6.904,4.842c-0.341,0.039-0.682,0.059-1.021,0.059c-2.613,0-5.114-1.157-6.808-3.192L42.419,93.614  c-2.378,35.834-10.995,131.805-10.995,131.805c0,6.998-5.398,12.396-12.396,12.396s-12.396-5.398-12.396-12.396  c0,0-4.598-92.204-4.598-95.371c0,0-0.034-71.339-0.034-71.57c0-7.97,6.091-13.605,13.605-13.605c5.692,0,10.073,1.924,14.649,6.516  c0.131,0.132,36.851,44.193,36.851,44.193c-0.062-0.074,16.261-33.095,19.507-39.002c4.344-7.903,10.612-11.71,18.6-11.765  c0.019,0,0.041-0.005,0.059-0.005c0,0,45.073,0.012,45.348,0.022c8.069-0.022,14.396,3.788,18.772,11.752  c0.091,0.157,19.506,38.998,19.506,38.998s36.714-44.061,36.854-44.196c4.473-4.689,9.55-6.513,14.645-6.513  c7.514,0,13.605,6.091,13.605,13.605C254,61.212,253.966,130.048,253.966,130.048z"/>
                        </svg>);

export default function HomePage() {
    return (
        <div className="homepage-container">
            {/* Hero Section */}
            <section className="hero-section-middle">
                <motion.div
                    className="hero-content-middle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.2 }}
                >
                    <motion.h1 
                        className="hero-title"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                    >
                        Learning Python With Fun
                    </motion.h1>
                    <motion.h2 
                        className="hero-subtitle"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                    >
                        With the Hybrid Education Game
                    </motion.h2>
                    <motion.p 
                        className="hero-description"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                    >
                        Over 100+ Components waiting for You!
                    </motion.p>
                    <motion.div 
                        className="hero-cta"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.6 }}
                    >
                        <a href="/dashboard" className="cta-button primary">
                            Start Learning
                        </a>
                        <a href="/dashboard?selector=2" className="cta-button secondary">
                            Play with Friends
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
                <motion.h2 
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    A New Way to Learn
                </motion.h2>
                <div className="steps-container">
                    <motion.div
                        className="step-card step-1"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0 }}
                    >
                        <CodeIcon />
                        <h3 className="step-title">1. Learn Concepts</h3>
                        <p className="step-description">
                            Master Python fundamentals through guided, interactive tutorials and quests.
                        </p>
                    </motion.div>
                    <motion.div
                        className="step-card step-2"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <PlayIcon />
                        <h3 className="step-title">2. Apply in Game</h3>
                        <p className="step-description">
                            Use your new coding skills to battle monsters and solve challenges in an RPG world.
                        </p>
                    </motion.div>
                    <motion.div
                        className="step-card step-3"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <TrophyIcon />
                        <h3 className="step-title">3. Gain Mastery</h3>
                        <p className="step-description">
                            Earn achievements, level up, and collaborate with friends to become a Python master.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features Section  */}
            <section className="features-section">
               
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: false, amount: 0.2 }} 
                        className="hp-feature-card" 
                    >
                        <div className="feature-content">
                            <div className="feature-text">
                                <h3 className="feature-title">Get Started Now</h3>
                                <p className="feature-description">
                                    Begin your Python journey with interactive lessons and hands-on coding challenges designed for all skill levels.
                                </p>
                                <a href="/dashboard" className="feature-button button-green">
                                    Start Learning →
                                </a>
                            </div>
                            <div className="feature-visual">
                                <PythonIcon /> 
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        viewport={{ once: false, amount: 0.2 }} 
                        className="hp-feature-card reverse" 
                    >
                        <div className="feature-content">
                            <div className="feature-visual">
                                <UsersIcon /> 
                            </div>
                            <div className="feature-text">
                                <h3 className="feature-title">Play With Friends</h3>
                                <p className="feature-description">
                                    Join multiplayer coding sessions and collaborate with friends to solve challenges together in a fun, interactive environment.
                                </p>
                                <a href="/dashboard?selector=2" className="feature-button button-blue">
                                    Start Playing →
                                </a>
                            </div>
                        </div>
                    </motion.div>
                
            </section>

            {/* Final Call-to-Action Section  */}
            <section className="final-cta-section">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    viewport={{ once: false, amount: 0.3 }} 
                    className="final-cta-content"
                >
                    <h2 className="final-cta-title">Ready to Start Your Python Journey?</h2>
                    <p className="final-cta-description">
                        Join thousands of learners who are mastering Python through our interactive platform.
                    </p>
                    <div className="final-cta-buttons">
                        <a href="/login" className="cta-button primary large">
                            Sign Up Free
                        </a>
                        <a href="/about" className="cta-button secondary large">
                            Learn More
                        </a>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}