
import '../css/loading.css'

export default function LoadingObject() {
    return(
            <div className="loadContainerOverlay">
                <div className="loading-containerLoad">
                    <div className="SpinnerObject"></div>
                    <p>Processing...</p>
                </div>
            </div>
    )
}