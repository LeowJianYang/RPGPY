"use client"

import { useUserStore } from "../../components/UserStore"
import type React from "react"
import { useEffect, useState,useRef } from "react"
import { Dropdown } from "antd"
import type { MenuProps } from "antd"
import { ModalForm, SelfButton } from "../components/Modal"
import type { ModalFormProps } from "../utils/ButtonCompo"
import {HomeTwoTone, UserOutlined,TrophyTwoTone,InfoCircleTwoTone, ShopOutlined } from "@ant-design/icons"
import { FaRankingStar } from "react-icons/fa6";
import { MdDiamond } from "react-icons/md";
//import type { ModalFormProps } from "../components/ButtonCompo"
import 'intro.js';
import 'intro.js/introjs.css';
import { WarningTwoTone } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  RocketOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  StarOutlined,
  DownOutlined,
} from "@ant-design/icons"
import "../css/Dashboard.css"
import introJs from "intro.js"
 const URL = import.meta.env.VITE_API_URL;

interface UserStat {
  completed: number
  inProgress: number
  totalScore: number
  rank: number
}

interface Player {
    username: string,
    score: number,
    status: string,
}

interface PlayerWithRank extends Player{
   rank: number
}

type RoomCodeWithRank = Record<string, PlayerWithRank[]>;

interface quickAction {
    name: string,
    description: string,
    icon?: React.ReactNode,
    link: string
};

interface LeaderboardEntry {
  username: string | null
  score: number
  rank: number
  status?: string
}

const DashPage: React.FC = () => {
  const { setUser,user } = useUserStore()
  const [userStats, setUserStats] = useState<UserStat>({
    completed: 0,
    inProgress: 0,
    totalScore: 0,
    rank: 0,
  })
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderBoardWithRoom, setLeaderBoardWithRoom] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string>('')
  const [selectedRoomFill, setSelectedRoomFill] = useState<string>('All Rooms')
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<ModalFormProps>();
  const [quickActions, setQuickActions] = useState<quickAction[]>([]);
  const stateQueryLeaderboard = useRef<any>({});
  const navigate = useNavigate();

  useEffect(() => {
      try{
        axios.get(`${URL}/authCookie`, { withCredentials: true }).then((res) => {
            setUser({
                email: res.data.Email,
                user: res.data.Username,
                uid: res.data.uid
            });
            console.log(res.data);
        })
        .catch((err)=>{
            console.log("Not logged in:", err);
        });
      } catch (error) {
        console.error("Error fetching auth cookie:", error);
      }
  },[]);



  useEffect(() => {

    // Fetch user stats
    const fetchData = async () => {
      setUsername(user?.user || "NOT_FOUND");
      console.log("Fetching dashboard data for user:", user?.user, user?.uid);
      try {
        setLoading(true)

        const storedLeaderboard = await axios.get(`${URL}/game/leaderboard`, {params: {uid: user?.uid}, withCredentials:true});
        const {queryLeaderboard} = storedLeaderboard.data;
        stateQueryLeaderboard.current = queryLeaderboard;

        console.log("Leaderboard Data:", queryLeaderboard);
      }
       catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
      finally{

        const mockUserStats: UserStat = {
          completed: 5,
          inProgress: 3,
          totalScore: 1250,
          rank: 8,
        }
            
      const quickItems: quickAction[] =[
        {name: "Start A Game", description: "Begin a new coding adventure with friends", icon: <RocketOutlined />, link: "/dashboard?selector=2"},
        {name: "Join A Game", description: "Enter a room code to join an existing game", icon: <FaRankingStar />, link: "/dashboard?selector=2"},
        {name: "Profiles", description: "View Profile details and Achievement", icon: <BookOutlined />, link: "/dashboard?selector=3"},
        {name: "Settings", description: "Review settings and preferences", icon: <SettingOutlined />, link: "/settings"},
        {name: "Shop", description: "Browse and purchase items for your adventures", icon: <ShopOutlined/>, link:"/shop"}
      ];
      



        const allLeaderboard = Object.values(stateQueryLeaderboard.current)
        .flat()  // Let it become the whole status. 
        .map((player: any)=>({
            username: player.username,
            score: player.score,
            status: player.status
        }))
        .sort((a, b)=> b.score - a.score)
        .map((player, index)=>({
          ...player,
          rank:index+1,
        }))

        const rankedRoomLeaderboard = Object.entries(stateQueryLeaderboard.current as Record<string, Player[]>).reduce((acc,[roomCodes, players])=>{

            const sorted = [...players].sort((a,b)=> b.score - a.score);
            
            const AddedRank= sorted.map((p,idx)=>({
              ...p,
              rank: idx+1,
            }));

            acc[roomCodes] = AddedRank;
            return acc;
        }, {} as RoomCodeWithRank)


        const mockLeaderboard: LeaderboardEntry[] = allLeaderboard

        setUserStats(mockUserStats);
        setLeaderboard(mockLeaderboard);
        setQuickActions(quickItems);
        setLeaderBoardWithRoom(rankedRoomLeaderboard);
        console.log("Leaderboard with room data:", allLeaderboard)
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const roomCodes= Object.keys(leaderBoardWithRoom || {});

  const items: MenuProps['items'] = roomCodes.map((code,idx)=>({
        key: idx+1,
        label: `Room Code: ${code}`
  }))


  const handleClickLeaderboard = async (index:number)=>{
      setIsModalOpen(true);
      if (selectedRoomFill === 'All Rooms')
          {    setModalProps({
            title: "Leaderboard Details",
            onOk: ()=>{ setIsModalOpen(false); },
            onCancel: ()=>{ setIsModalOpen(false); },
            onClose: ()=>{ setIsModalOpen(false); },
            open: isModalOpen,
            children: (
              <div className="leaderboard-modal-content">
                <div className="leaderboard-modal-header">
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                    Specific Details
                  </h3>
                </div>
                <div className="leaderboard-modal-body">
                  <div className="modal-info-grid">
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ background: '#fbbf24', color: 'white' }}><HomeTwoTone /></div>
                        <span>Room Code</span>
                      </div>
                      <div className="room-code-display">{roomCodes[index] || "N/A"}</div>
                    </div>
                    
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ background: '#6366f1', color: 'white' }}><UserOutlined /></div>
                        <span>Username</span>
                      </div>
                      <div className="modal-info-value">{leaderboard[index].username || "N/A"}</div>
                    </div>
                    
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ background: '#10b981', color: 'white' }}><MdDiamond /></div>
                        <span>Score</span>
                      </div>
                      <div className="score-display">{leaderboard[index].score} pts</div>
                    </div>
                    
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ background: '#f59e0b', color: 'white' }}><FaRankingStar /></div>
                        <span>Rank</span>
                      </div>
                      <div className={`rank-badge-modal ${
                        leaderboard[index].rank === 1 ? 'rank-1' : 
                        leaderboard[index].rank === 2 ? 'rank-2' : 
                        leaderboard[index].rank === 3 ? 'rank-3' : 'rank-other'
                      }`}>
                        {leaderboard[index].rank <= 3 && <span className="modal-trophy-icon"><TrophyTwoTone /></span>}
                        #{leaderboard[index].rank}
                      </div>
                    </div>
                    
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ 
                          background: leaderboard[index].status === 'victory' ? '#10b981' :
                                     leaderboard[index].status === 'playing' ? '#3b82f6' :
                                     leaderboard[index].status === 'quit' ? '#f59e0b' : '#ef4444',
                          color: 'white' 
                        }}><InfoCircleTwoTone /></div>
                        <span>Status</span>
                      </div>
                      <div className={`status-badge-modal ${leaderboard[index].status || 'unknown'}`}>
                        <div className="status-indicator"></div>
                        {leaderboard[index].status || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
            footer: (
              <SelfButton type="danger" onClick={()=>{setIsModalOpen(false);}}>
                  Close
              </SelfButton>
            )
          });
        }

        else {
           const selectedData = leaderBoardWithRoom && leaderBoardWithRoom[selectedRoomFill][index];
            setModalProps({
            title: "Leaderboard Details",
            onOk: ()=>{ setIsModalOpen(false); },
            onCancel: ()=>{ setIsModalOpen(false); },
            onClose: ()=>{ setIsModalOpen(false); },
            open: isModalOpen,
            children: (
              <div className="leaderboard-modal-content" >
                <div className="leaderboard-modal-header">
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                    Specific Details
                  </h3>
                </div>
                <div className="leaderboard-modal-body">
                  <div className="modal-info-grid">
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ background: '#fbbf24', color: 'white' }}><HomeTwoTone /></div>
                        <span>Room Code</span>
                      </div>
                      <div className="room-code-display">{selectedRoomFill}</div>
                    </div>
                    
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ background: '#6366f1', color: 'white' }}><UserOutlined /></div>
                        <span>Username</span>
                      </div>
                      <div className="modal-info-value">{selectedData?.username || "N/A"}</div>
                    </div>
                    
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ background: '#10b981', color: 'white' }}><MdDiamond /></div>
                        <span>Score</span>
                      </div>
                      <div className="score-display">{selectedData?.score || 0} pts</div>
                    </div>
                    
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ background: '#f59e0b', color: 'white' }}><FaRankingStar /></div>
                        <span>Rank</span>
                      </div>
                      <div className={`rank-badge-modal ${
                        selectedData?.rank === 1 ? 'rank-1' : 
                        selectedData?.rank === 2 ? 'rank-2' : 
                        selectedData?.rank === 3 ? 'rank-3' : 'rank-other'
                      }`}>
                        {selectedData?.rank <= 3 && <span className="modal-trophy-icon"><TrophyTwoTone /></span>}
                        #{selectedData?.rank || 'N/A'}
                      </div>
                    </div>
                    
                    <div className="modal-info-item">
                      <div className="modal-info-label">
                        <div className="modal-info-icon" style={{ 
                          background: selectedData?.status === 'victory' ? '#10b981' :
                                     selectedData?.status === 'playing' ? '#3b82f6' :
                                     selectedData?.status === 'quit' ? '#f59e0b' : '#ef4444',
                          color: 'white' 
                        }}><InfoCircleTwoTone /></div>
                        <span>Status</span>
                      </div>
                      <div className={`status-badge-modal ${selectedData?.status || 'unknown'}`}>
                        <div className="status-indicator"></div>
                        {selectedData?.status || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
            footer: (
              <SelfButton type="danger" onClick={()=>{setIsModalOpen(false);}}>
                  Close
              </SelfButton>
            )
            });
        }

  }


  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your adventure dashboard...</p>
        </div>
      </div>
    )
  }

  const handleTutorialStart = async ()=>{
    introJs.tour().start();
  }

  // Format username for display - limit to 15 characters with ellipsis
 
  const displayUsername =
    (username || "Explorer").length > 15 ? `${(username || "Explorer").substring(0, 15)}...` : username || "Explorer"

  return (
    <div className="dashboard-container" data-title="Welcome to RPGPy !" data-intro={`This is your dashboard where you can track your learning adventures, stats, and more.\n Left side is the navigation menu to explore different sections of the platform.\n Click Multiplayer to start your journey !`}>

       <button onClick={()=>{handleTutorialStart()}}>Start Tutorial</button>

      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome back, <span className="username-highlight">{displayUsername}</span>! 👋
            </h1>
            <p className="welcome-subtitle">Continue your coding journey and unlock new achievements</p>
          </div>
          <div className="streak-badge">
            <FireOutlined className="streak-icon" />
            <div className="streak-info">
              <span className="streak-number">7</span>
              <span className="streak-label">day streak</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card completed">
          <div className="stat-header">
            <div className="stat-icon-wrapper">
              <CheckCircleOutlined className="stat-icon" />
            </div>
            <div className="stat-trend">+12%</div>
          </div>
          <div className="stat-main">
            <h2 className="stat-value">{userStats.completed}</h2>
            <p className="stat-label">Completed</p>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "85%" }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card in-progress">
          <div className="stat-header">
            <div className="stat-icon-wrapper">
              <BookOutlined className="stat-icon" />
            </div>
            <div className="stat-trend">+3</div>
          </div>
          <div className="stat-main">
            <h2 className="stat-value">{userStats.inProgress}</h2>
            <p className="stat-label">In Progress</p>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card score">
          <div className="stat-header">
            <div className="stat-icon-wrapper">
              <TrophyOutlined className="stat-icon" />
            </div>
            <div className="stat-trend">+250</div>
          </div>
          <div className="stat-main">
            <h2 className="stat-value">{userStats.totalScore.toLocaleString()}</h2>
            <p className="stat-label">Total Score</p>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "75%" }}></div>
            </div>
          </div>
        </div>

        <div className="stat-card rank">
          <div className="stat-header">
            <div className="stat-icon-wrapper">
              <StarOutlined className="stat-icon" />
            </div>
            <div className="stat-trend rank-trend">↑2</div>
          </div>
          <div className="stat-main">
            <h2 className="stat-value">#{userStats.rank}</h2>
            <p className="stat-label">Global Rank</p>
          </div>
          <div className="stat-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "90%" }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="main-content">
          <div className="dashboard-card quick-actions-list">
            <h3 className="card-title">Quick Actions</h3>
               {quickActions.map((actions, idx)=>(
                  <div key={idx} className="quick-action-item" onClick={()=>{navigate(actions.link)}}> 
                      {actions.icon}
                      <p className="quick-action-name">{actions.name}</p>
                      <p className="quick-action-desc">{actions.description}</p>
                  </div>
               ))}
          </div>

          <div className="dashboard-card cta-card">
            <div className="cta-content">
              <div className="cta-icon">
                <RocketOutlined />
              </div>
              <div className="cta-text">
                <h3 className="cta-title">Ready for Your Next Challenge?</h3>
                <p className="cta-description">
                  Discover new Python adventures tailored to your skill level and interests.
                </p>
              </div>
              <button className="cta-button" onClick={()=>{navigate("/dashboard?selector=2")}}>
                <span>Start New Adventure</span>
                <RocketOutlined className="button-icon" />
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="dashboard-card leaderboard-card" data-title="Leaderboard" data-intro="Check out the leaderboard to see how you rank among other adventurers!">
            <div className="card-header">
              <div className="card-title-section">
                <h3 className="card-title" style={{display:"flex", gap:'1rem'}}>Leaderboard
                  <Dropdown
                    menu={{
                      items,
                      selectable: true,
                      defaultSelectedKeys: ['0'],
                      onClick: (e)=>{
                         const selectedFilter = e.key;
                         const SelectedRoomCode = roomCodes[Number(selectedFilter)-1];
                         setSelectedRoomFill(SelectedRoomCode);
                      }
                    }}
                  >
                      <DownOutlined />
                    </Dropdown>
                    <a onClick={()=>{setSelectedRoomFill('All Rooms')}}
                      className="clear-filter-anchor"
                      >
                      Clear
                    </a>
                </h3>
                
                <span className="card-subtitle">Top performers</span>
              </div>
            </div>
            <div className="leaderboard-list">
               {selectedRoomFill === 'All Rooms' ? (

                leaderboard.length >0 ?(

                  leaderboard.map((entry, index) => (
                  <div key={index} className={`leaderboard-item ${entry.username === username ? "current-user" : ""}`} onClick={()=>{
                      handleClickLeaderboard(index);
                  }}>
                    <div className="rank-section">
                      <div className={`rank-badge ${entry.rank <= 3 ? "top-rank" : ""}`}>
                        <span className="rank-number">#{entry.rank}</span>
                      </div>
                      {entry.rank <= 3 && <TrophyOutlined className="trophy-icon" />}
                    </div>
                    <div className="user-section">
                      <span className="username">{entry.username === username ? "You" : entry.username}</span>
                      <span className="user-score">{entry.score} pts</span>
                    </div>
                  </div>
              ))) :(
                  <p className="no-data-text"> <WarningTwoTone style={{color:"#faad14"}}/>No leaderboard data available.</p>
              )
               ):(
                      leaderBoardWithRoom[selectedRoomFill].length>0 ? (

                      leaderBoardWithRoom && leaderBoardWithRoom[selectedRoomFill].map((data:any, ind:any)=>(
                          <div key={ind} className={`leaderboard-item ${data.username === username ? "current-user" : ""}`}
                          onClick={()=>{
                              handleClickLeaderboard(ind);
                          }}
                          >
                            <div className="rank-section">
                              <div className={`rank-badge ${data.rank <= 3 ? "top-rank" : ""}`}>
                                <span className="rank-number">#{data.rank}</span>
                              </div>
                              {data.rank <= 3 && <TrophyOutlined className="trophy-icon" />}
                            </div>
                            <div className="user-section">
                              <span className="username">{data.username === username ? "You" : data.username}</span>
                              <span className="user-score">{data.score} pts</span>
                            </div>
                          </div>
                      ))):(
                          <p className="no-data-text"><WarningTwoTone style={{color:"#faad14"}}/> No data for selected room.</p>
                      )
               )}
               <hr />

               <div className="leaderboard-legend-section">
                   <p> All Records will only store <strong>24</strong> hours upon the game start</p>
               </div>

            </div>
          </div>

          <div className="dashboard-card announcements-card">
            <div className="card-header">
              <div className="card-title-section">
                <h3 className="card-title">Latest Updates</h3>
                <span className="card-subtitle">Stay informed</span>
              </div>
            </div>
            <div className="announcements-list">
              <div className="announcement-item featured">
                <div className="announcement-icon">🚀</div>
                <div className="announcement-content">
                  <h4 className="announcement-title">New Challenge Available!</h4>
                  <p className="announcement-text">Web Scraping Basics - Perfect for intermediate learners</p>
                </div>
              </div>
              <div className="announcement-item">
                <div className="announcement-icon">📅</div>
                <div className="announcement-content">
                  <h4 className="announcement-title">Live Session This Friday</h4>
                  <p className="announcement-text">Advanced Python Patterns with industry experts</p>
                </div>
              </div>
              <div className="announcement-item">
                <div className="announcement-icon">👥</div>
                <div className="announcement-content">
                  <h4 className="announcement-title">Community Event</h4>
                  <p className="announcement-text">Code review session this weekend - join us!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

          <ModalForm
            title={modalProps?.title || "UNDEFINED"}
            onOk={modalProps?.onOk || (()=>{})}
            onCancel={modalProps?.onCancel || (()=>{})}
           onClose={modalProps?.onClose || (()=>{})}
            open={isModalOpen}
            footer={
              modalProps?.footer
            }
            multi={false}
          >
            {modalProps?.children || null}
          </ModalForm>


    </div>
  )
}

export default DashPage
