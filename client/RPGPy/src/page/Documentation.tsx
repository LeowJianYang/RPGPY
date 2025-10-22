import { SelfButton } from '../components/ErrorModal';
import DocsNavBar, { FooterBar } from '../components/navigation';
import './../css/Documentation.css';
import {useToast} from '../components/Toast';
import tutorial from '../assets/Tutorial.md?raw';

import axios from 'axios';
import MarkdownReader from '../components/MarkdownReader';

const Documentation = () => {
  const {notify} = useToast();
  const URL = import.meta.env.VITE_API_URL;

  const handleDownloadMap = async ()=>{
    try{
    const res= await axios.get(`${URL}/map/v1/download`, {responseType: 'blob', withCredentials:true});  
    const url= window.URL.createObjectURL(new Blob([res.data]));
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download','MAP001.pdf');
    document.body.appendChild(link);
    link.click();
    notify("success", "Download Started", "Your map download has started.", "bottomRight");
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch(err){
    console.error("Error downloading map:", err);
    notify("error", "Download Failed", "Could not download the map. Please try again later.", "top");
  } };

  return (
    <div className="doc-container">
      <DocsNavBar/>
      <header className="doc-header">
        <h1>Project Documentation</h1>
        <p>Welcome to the official documentation. Here you'll find tutorials and license information.</p>
      </header>

      <main className="doc-main">
        <section id="tutorial" className="doc-section">
          <h2>Tutorial</h2>
          <div className="doc-card">
            <MarkdownReader content={tutorial}/>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <SelfButton
                type='primary'
                onClick={() => {
                  handleDownloadMap();
                }}
              >
                Download Physical Map
              </SelfButton>
            </div>
            {/* Placeholder for future content */}
          </div>
        </section>

        <section id="licenses" className="doc-section">
          <h2>Open Source Licenses</h2>
          <div className="doc-card">
            <h3>MIT License</h3>
            <p>This project is licensed under the MIT License.</p>
            <pre className="license-text">
              {`
Copyright (c) 2025 [Your Name or Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
              `}
            </pre>
          </div>
          <div className="doc-card">
            <h3>Third-Party Libraries</h3>
            <p>This project utilizes the following open-source libraries:</p>
            <ul>
              <li><strong>React:</strong> Licensed under the MIT License.</li>
              <li><strong>Ant Design:</strong> Licensed under the MIT License.</li>
              <li><strong>Axios:</strong> Licensed under the MIT License.</li>
              <li><strong>Socket.IO:</strong> Licensed under the MIT License.</li>
              <li><strong>Express:</strong> Licensed under the MIT License.</li>
            </ul>
          </div>
        </section>
      </main>
      <FooterBar/>
    </div>
  );
};

export default Documentation;
