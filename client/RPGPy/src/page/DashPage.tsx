"use client"

import { useUserStore } from "../../components/UserStore"
import type React from "react"
import { useEffect, useState } from "react"
import { Dropdown } from "antd"
import type { MenuProps } from "antd"

import axios from "axios"
import {
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  RocketOutlined,
  StarOutlined,
  CheckCircleOutlined,
  DownOutlined,
} from "@ant-design/icons"
import "../css/Dashboard.css"
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

interface Adventure {
  id: string
  title: string
  progress: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
}

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
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderBoardWithRoom, setLeaderBoardWithRoom] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string>('')
  const [selectedRoomFill, setSelectedRoomFill] = useState<string>('All Rooms')
  
  useEffect(() => {
      try{
        axios.get(`${URL}/authCookie`, { withCredentials: true }).then((res) => {
            setUser({
                email: res.data.email,
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
        
        
        console.log("Leaderboard Data:", queryLeaderboard);

        const mockUserStats: UserStat = {
          completed: 5,
          inProgress: 3,
          totalScore: 1250,
          rank: 8,
        }


        const mockAdventures: Adventure[] = [
          { id: "1", title: "The Beginner's Python", progress: 100, difficulty: "Beginner" },
          { id: "2", title: "Functions & Logic", progress: 75, difficulty: "Beginner" },
          { id: "3", title: "Data Structures Deep Dive", progress: 50, difficulty: "Intermediate" },
          { id: "4", title: "File I/O Adventure", progress: 25, difficulty: "Intermediate" },
          { id: "5", title: "API Integration Quest", progress: 10, difficulty: "Advanced" },
        ]

        const allLeaderboard = Object.values(queryLeaderboard)
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

        const rankedRoomLeaderboard = Object.entries(queryLeaderboard as Record<string, Player[]>).reduce((acc,[roomCodes, players])=>{

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
        setAdventures(mockAdventures);
        setLeaderboard(mockLeaderboard);
        setLeaderBoardWithRoom(rankedRoomLeaderboard);
        console.log("Leaderboard with room data:", allLeaderboard)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
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

  

  const getDifficultyColor = (difficulty: Adventure["difficulty"]) => {
    switch (difficulty) {
      case "Beginner":
        return "difficulty-beginner"
      case "Intermediate":
        return "difficulty-intermediate"
      case "Advanced":
        return "difficulty-advanced"
      default:
        return "difficulty-beginner"
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

  // Format username for display - limit to 15 characters with ellipsis
 
  const displayUsername =
    (username || "Explorer").length > 15 ? `${(username || "Explorer").substring(0, 15)}...` : username || "Explorer"

  return (
    <div className="dashboard-container">
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
          <div className="dashboard-card adventures-card">
            <div className="card-header">
              <div className="card-title-section">
                <h3 className="card-title">Your Learning Adventures</h3>
                <span className="active-count">{adventures.filter((a) => a.progress < 100).length} active</span>
              </div>
            </div>
            <div className="adventures-list">
              {adventures.map((adventure) => (
                <div key={adventure.id} className="adventure-item">
                  <div className="adventure-content">
                    <div className="adventure-info">
                      <h4 className="adventure-title">{adventure.title}</h4>
                      <span className={`difficulty-badge ${getDifficultyColor(adventure.difficulty)}`}>
                        {adventure.difficulty}
                      </span>
                    </div>
                    <div className="progress-section">
                      <div className="progress-container">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${adventure.progress}%` }}></div>
                        </div>
                        <span className="progress-percentage">{adventure.progress}%</span>
                      </div>
                      {adventure.progress === 100 && (
                        <div className="completion-badge">
                          <CheckCircleOutlined /> Complete
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              <button className="cta-button">
                <span>Start New Adventure</span>
                <RocketOutlined className="button-icon" />
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="dashboard-card leaderboard-card">
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
                 leaderboard.map((entry, index) => (
                <div key={index} className={`leaderboard-item ${entry.username === username ? "current-user" : ""}`}>
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
              ))
               ):(
                     leaderBoardWithRoom && leaderBoardWithRoom[selectedRoomFill].map((data:any, ind:any)=>(
                        <div key={ind} className={`leaderboard-item ${data.username === username ? "current-user" : ""}`}>
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
                     ))
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
    </div>
  )
}

export default DashPage
