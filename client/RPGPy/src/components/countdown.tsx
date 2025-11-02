
import { useState, useEffect } from "react";
import styles from "../css/module/coundown.module.css";

interface timebarProps {

    intervalTime: number;
    onTimeUp: ()=>void;
}




export default function Countdown( props: timebarProps) {
    const [timeLeft, setTimeLeft] = useState(props.intervalTime);
    
   useEffect(()=>{
    setTimeLeft(props.intervalTime);
   },[props.intervalTime])

   useEffect(()=>{
 
    if (timeLeft <= 0) {
        return;
    };

    const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
            const newTime = prevTime - 1;

            if (newTime <= 0){
                
                setTimeout(() => props.onTimeUp(), 0); 
                return 0;
            }
            return newTime;
        });

    }, 1000);

    return () => clearInterval(timer);

   },[timeLeft]) 

   const remainTimePercentage = timeLeft > 0 ? (timeLeft / props.intervalTime) * 100 : 0;

    return (
        <div className={styles.countdownContainer}>
            <div className={styles.timeIndicators} style={{ width: `${remainTimePercentage}%` }}></div>
            <p className={styles.timeText}>Time remaining: {timeLeft} s</p>

        </div>
    );
}