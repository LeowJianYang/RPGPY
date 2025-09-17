import React from 'react';
import '../css/HealthBar.css';


    interface HealthBarProps{
        current: number;
        maxHealth:number;
    };

    const HealthBar: React.FC<HealthBarProps>=({current, maxHealth})=>{

        const percent = Math.max(0,(current / maxHealth)*100);

        return(
            <div className='health-bar-container'>
                <div className='health-bar-fill'
                    style={{width: `${percent}%`}}
                >
                    <p className='health-bar-text'>{current}/{maxHealth}</p>
                </div>
            </div>
        )
    }

export default HealthBar;