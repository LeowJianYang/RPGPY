"use client"

import { useUserStore } from "../../components/UserStore"
import type React from "react"
import { useEffect, useState } from "react"
import {
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  RocketOutlined,
  StarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons"
import "../css/Dashboard.css"

interface UserStat {
  completed: number
  inProgress: number
  totalScore: number
  rank: number
}

interface Adventure {
  id: string
  title: string
  progress: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
}

interface LeaderboardEntry {
  username: string
  score: number
  rank: number
}

const DashPage: React.FC = () => {
  const { user } = useUserStore()
  const [userStats, setUserStats] = useState<UserStat>({
    completed: 0,
    inProgress: 0,
    totalScore: 0,
    rank: 0,
  })
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string>("")

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem("username") || user || ""
    if (storedUsername) {
      setUsername(storedUsername)
    }

    // Fetch user stats
    const fetchData = async () => {
      try {
        setLoading(true)

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

        const mockLeaderboard: LeaderboardEntry[] = [
          { username: "pythonmaster", score: 2200, rank: 1 },
          { username: "codewarrior", score: 1950, rank: 2 },
          { username: "devninja", score: 1800, rank: 3 },
          { username: "scriptguru", score: 1600, rank: 4 },
          { username: storedUsername || "you", score: 1250, rank: 5 },
        ]

        setUserStats(mockUserStats)
        setAdventures(mockAdventures)
        setLeaderboard(mockLeaderboard)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

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
                <h3 className="card-title">Leaderboard</h3>
                <span className="card-subtitle">Top performers</span>
              </div>
            </div>
            <div className="leaderboard-list">
              {leaderboard.map((entry, index) => (
                <div key={index} className={`leaderboard-item ${entry.username === username ? "current-user" : ""}`}>
                  <div className="rank-section">
                    <div className={`rank-badge ${entry.rank <= 3 ? "top-rank" : ""}`}>
                      <span className="rank-number">#{entry.rank}</span>
                    </div>
                    {entry.rank <= 3 && <TrophyOutlined className="trophy-icon" />}
                  </div>
                  <div className="user-section">
                    <span className="username">{entry.username === username ? "You" : entry.username}</span>
                    <span className="user-score">{entry.score.toLocaleString()} pts</span>
                  </div>
                </div>
              ))}
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
