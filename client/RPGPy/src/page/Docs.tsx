import React, { useState } from 'react';
import { CloseOutlined, MenuOutlined, BookOutlined, RocketOutlined, DownloadOutlined, 
         SafetyCertificateOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import {DocsNavBar, FooterBar } from '../components/navigation';
import { SelfButton } from '../components/Modal';
import '../css/Docs.css';
import { useToast } from '../components/Toast';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const URL = import.meta.env.VITE_API_URL;

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  children?: DocSection[];
}

const Docs: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notify } = useToast();
  const [searchParams,setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('navigator');
  const docSections: DocSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <RocketOutlined />,
      children: [
        { id: 'installation', title: 'Installation', icon: <SettingOutlined /> },
        { id: 'quick-start', title: 'Quick Start', icon: <RocketOutlined /> }
      ]
    },
    {
      id: 'tutorial',
      title: 'Tutorial',
      icon: <BookOutlined />,
      children: [
        { id: 'basic-concepts', title: 'Basic Concepts', icon: <BookOutlined /> },
        { id: 'advanced-features', title: 'Advanced Features', icon: <SettingOutlined /> }
      ]
    },
    {
      id: 'resources',
      title: 'Resources',
      icon: <DownloadOutlined />,
      children: [
        { id: 'downloads', title: 'Downloads', icon: <DownloadOutlined /> },
        { id: 'libraries', title: 'Libraries', icon: <BookOutlined /> }
      ]
    },
    {
      id: 'licenses',
      title: 'Licenses',
      icon: <SafetyCertificateOutlined />
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: <QuestionCircleOutlined />
    }
  ];

  const renderSidebarItem = (section: DocSection, depth: number = 0) => (
    <div key={section.id} className={`sidebar-item depth-${depth}`}>
      <div
        className={`sidebar-link ${activeSection === section.id ? 'active' : ''}`}
        onClick={() => setSearchParams({ navigator: section.id })}
      >
        <span className="sidebar-icon">{section.icon}</span>
        <span className="sidebar-title">{section.title}</span>
      </div>
      {section.children && (
        <div className="sidebar-children">
          {section.children.map(child => renderSidebarItem(child, depth + 1))}
        </div>
      )}
    </div>
  );

  
  const handleDownloadMap = async (MapId: string)=>{
    try{
    const res= await axios.get(`${URL}/map/v1/download/${MapId}`, {responseType: 'blob', withCredentials:true});  
    const url= window.URL.createObjectURL(new Blob([res.data]));
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${MapId}.pdf`);
    document.body.appendChild(link);
    link.click();
    notify("success", "Download Started", "Your map download has started.", "bottomRight");
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch(err){
    console.error("Error downloading map:", err);
    notify("error", "Download Failed", "Could not download the map. Please try again later.", "top");
  } };


  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="docs-content">
            <h1>Getting Started with RPGPy</h1>
            <p className="lead">
              Welcome to RPGPy documentation. This modern web-based RPG platform provides 
              an immersive gaming experience with real-time multiplayer capabilities.
            </p>
            
            <div className="feature-grid">
              <div className="feature-card">
                <RocketOutlined className="feature-icon" />
                <h3>Quick Setup</h3>
                <p>Get started in minutes with our streamlined installation process</p>
              </div>
              <div className="feature-card">
                <BookOutlined className="feature-icon" />
                <h3>Rich Documentation</h3>
                <p>Comprehensive guides and tutorials for all skill levels</p>
              </div>
              <div className="feature-card">
                <SettingOutlined className="feature-icon" />
                <h3>Customizable</h3>
                <p>Flexible configuration options to suit your needs</p>
              </div>
            </div>

            <h2>System Requirements</h2>
            <ul>
              <li>Node.js 16+ or later</li>
              <li>Modern web browser with ES2020 support</li>
              <li>At least 4GB RAM recommended</li>
              <li>Stable internet connection for multiplayer features</li>
            </ul>
          </div>
        );

      case 'installation':
        return (
          <div className="docs-content">
            <h1>Installation Guide</h1>
            <p className="lead">Follow these steps to install RPGPy on your system.</p>

            <h2>Prerequisites</h2>
            <p>Before installing RPGPy, ensure you have the following prerequisites:</p>
            <ul>
              <li>Node.js (version 16 or higher)</li>
              <li>npm or yarn package manager</li>
              <li>Git for version control</li>
            </ul>

            <h2>Installation Steps</h2>
            <div className="tutorial-card">
              <h3>1. Clone the Repository</h3>
              <div className="code-block">
                <pre><code>git clone https://github.com/LeowJianYang/FWDDWEB.git
cd rpgpy</code></pre>
              </div>

              <h3>2. Install Dependencies</h3>
              <div className="code-block">
                <pre><code>npm install
# or
yarn install</code></pre>
              </div>

              <h3>3. Start Development Server</h3>
              <div className="code-block">
                <pre><code>npm run dev
# or
yarn dev</code></pre>
              </div>
            </div>
          </div>
        );

      case 'quick-start':
        return (
          <div className="docs-content">
            <h1>Quick Start Guide</h1>
            <p className="lead">Get up and running with RPGPy in just a few minutes.</p>

            <h2>First Steps</h2>
            <ol>
              <li>Complete the installation process</li>
              <li>Create your first character</li>
              <li>Explore the tutorial dungeon</li>
              <li>Join a multiplayer session</li>
            </ol>

            <h2>Creating Your Character</h2>
            <p>RPGPy offers multiple character classes and customization options:</p>
            <ul>
              <li><strong>Warrior</strong> - High defense and melee combat</li>
              <li><strong>Mage</strong> - Powerful magic spells and abilities</li>
              <li><strong>Rogue</strong> - Stealth and agility focused</li>
              <li><strong>Healer</strong> - Balanced combat and healing</li>
            </ul>
          </div>
        );

      case 'tutorial':
        return (
          <div className="docs-content">
            <h1>Tutorial</h1>
            <p className="lead">Learn the fundamentals of RPGPy through our comprehensive tutorial series.</p>

            <h2>Tutorial Overview</h2>
            <p>Our tutorial system is designed to gradually introduce you to all aspects of the game:</p>
            
            <div className="feature-grid">
              <div className="feature-card">
                <BookOutlined className="feature-icon" />
                <h3>Basic Concepts</h3>
                <p>Learn core game mechanics and interface</p>
              </div>
              <div className="feature-card">
                <SettingOutlined className="feature-icon" />
                <h3>Advanced Features</h3>
                <p>Master complex strategies and systems</p>
              </div>
            </div>
          </div>
        );

      case 'basic-concepts':
        return (
          <div className="docs-content">
            <h1>Basic Concepts</h1>
            <p className="lead">Understanding the fundamental concepts of RPGPy gameplay.</p>

            <h2>Core Mechanics</h2>
            <h3>Character Attributes</h3>
            <ul>
              <li><strong>Health Points (HP)</strong> - Your character's life force</li>
              <li><strong>Tiles</strong> - Show the current tiles explored</li>
              <li><strong>Attack (ATK)</strong> - Physical attack power</li>
              <li><strong>Score</strong> - Scoring of the game</li>
            </ul>

            <h3>Combat System</h3>
            <p>RPGPy features a turn-based combat system with real-time elements:</p>
            <ul>
              <li>Action queuing during battle</li>
              <li>Elemental damage types and resistances</li>
              <li>Combo attacks and special abilities</li>
            </ul>
          </div>
        );

      case 'advanced-features':
        return (
          <div className="docs-content">
            <h1>Advanced Features</h1>
            <p className="lead">Explore the advanced capabilities of RPGPy.</p>

            <h2>Multiplayer Mechanics</h2>
            <ul>
              <li>Real-time party formation</li>
              <li>Shared experience and loot systems</li>
              <li>Guild management and warfare</li>
              <li>Cross-server communication</li>
            </ul>

            <h2>Customization Options</h2>
            <ul>
              <li>Custom character builds and skill trees</li>
              <li>Map editor for creating custom dungeons</li>
              <li>Mod support and plugin system</li>
              <li>Theme and UI customization</li>
            </ul>
          </div>
        );

      case 'resources':
        return (
          <div className="docs-content">
            <h1>Resources</h1>
            <p className="lead">Download assets, tools, and additional content for RPGPy.</p>

            <div className="download-section">
              <div className="download-card">
                <h3>Game Assets</h3>
                <p>Sprites, textures, and audio files</p>
                <SelfButton 
                  // onClick={handleDownloadMap}
                >
                  Download Assets
                </SelfButton>
              </div>
              <div className="download-card">
                <h3>Development Tools</h3>
                <p>Map editor and modding utilities</p>
                <SelfButton 
                  //onClick={handleDownloadMap}
                >
                  Download Tools
                </SelfButton>
              </div>
            </div>
          </div>
        );

      case 'downloads':
        return (
          <div className="docs-content">
            <h1>Downloads</h1>
            <p className="lead">Get the latest versions and additional content.</p>

            <h2>Latest Release</h2>
            <div className="download-section">
              <div className="download-card">
                <h3>RPGPy v1.0.0- MAP001</h3>
                <p>Latest Version of MAP 001</p>
                <SelfButton 
                  onClick={() => handleDownloadMap("MAP001")}
                >
                  Download v1.0.0- MAP001
                </SelfButton>
              </div>
            </div>

            <h2>Different Versions</h2>
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Release Date</th>
                  <th>Size</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>v1.0.0 Tutorial</td>
                  <td>2025-10-15</td>
                  <td>172 KB</td>
                  <td><SelfButton onClick={() => handleDownloadMap("TutorialMap")}>Download</SelfButton></td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'libraries':
        return (
          <div className="docs-content">
            <h1>Libraries & Dependencies</h1>
            <p className="lead">External libraries and frameworks used in RPGPy.</p>

            <h2>Core Dependencies</h2>
            <div className="library-grid">
              <div className="library-card">
                <h3>React 18.2.0</h3>
                <p>UI framework for building user interfaces</p>
              </div>
              <div className="library-card">
                <h3>TypeScript 5.0</h3>
                <p>Type-safe JavaScript development</p>
              </div>
              <div className="library-card">
                <h3>Vite 4.4.0</h3>
                <p>Fast build tool and development server</p>
              </div>
              <div className="library-card">
                <h3>Socket.io 4.7.0</h3>
                <p>Real-time multiplayer communication</p>
              </div>
            </div>

            <h2>UI Libraries</h2>
            <div className="library-grid">
              <div className="library-card">
                <h3>Ant Design</h3>
                <p>Enterprise-class UI design language</p>
              </div>
              <div className="library-card">
                <h3>Tailwind CSS</h3>
                <p>Utility-first CSS framework</p>
              </div>
            </div>
          </div>
        );

      case 'licenses':
        return (
          <div className="docs-content">
            <h1>Licenses</h1>
            <p className="lead">Legal information and licensing terms for RPGPy.</p>

            <div className="license-card">
              <h2>MIT License</h2>
              <div className="license-text">
{`Copyright (c) 2024 LEOWJY

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
SOFTWARE.`}
              </div>
            </div>

            <h2>Third-Party Licenses</h2>
            <p>This project uses several open-source/ attributes needed libraries or assets. Please refer to their respective licenses:</p>
            <ul>
              <li><strong>React</strong> - MIT License</li>
              <li><strong>TypeScript</strong> - Apache License 2.0</li>
              <li><strong>Vite</strong> - MIT License</li>
              <li><strong>Ant Design</strong> - MIT License</li>
              <li><strong><a href='https://github.com/LeowJianYang/RPGPY/blob/master/CREDITS.md' style={{color: 'blue', cursor:"pointer"}}>Click Here for More Details</a></strong> </li>
            </ul>
          </div>
        );

      case 'help':
        return (
          <div className="docs-content">
            <h1>Help & Support</h1>
            <p className="lead">Get help and support for RPGPy.</p>

            <div className="help-section">
              <div className="help-card">
                <QuestionCircleOutlined className="feature-icon" />
                <h3>FAQ</h3>
                <p>Find answers to commonly asked questions</p>
              </div>
              <div className="help-card">
                <BookOutlined className="feature-icon" />
                <h3>Documentation</h3>
                <p>Comprehensive guides and API reference</p>
              </div>
              <div className="help-card">
                <SettingOutlined className="feature-icon" />
                <h3>Troubleshooting</h3>
                <p>Solutions for common issues and problems</p>
              </div>
            </div>

            <h2>Contact Support</h2>
            <p>If you need additional help, please contact our support team:</p>
            <ul>
              <li><strong>Email:</strong> PLEASE OPEN ISSUES ON GITHUB</li>
              <li><strong>Discord:</strong> RPGPy Community Server</li>
              <li><strong>GitHub:</strong> Report issues and bugs</li>
            </ul>

            <h2>Community Resources</h2>
            <ul>
              <li>Official Forum - Join discussions with other players</li>
              <li>YouTube Tutorials - Video guides and walkthroughs</li>
              <li>Twitch Streams - Live gameplay and development</li>
            </ul>
          </div>
        );

      default:
        return (
          <div className="docs-content">
            <h1>Documentation</h1>
            <p>Select a topic from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="docs-container">
      <DocsNavBar />
      
      <div className="docs-main-wrapper">
        <aside className={`docs-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>Documentation</h2>
            <CloseOutlined 
              className="sidebar-close-icon"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
          <nav className="sidebar-nav">
            {docSections.map(section => renderSidebarItem(section))}
          </nav>
        </aside>

        <main className="docs-main">
          <div className="docs-content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>

      <button 
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <MenuOutlined />
      </button>

      <FooterBar />
    </div>
  );
};

export default Docs;
