"use client"

import { useUserStore } from "../../components/UserStore"
import type React from "react"
import { useEffect, useState } from "react"
import {
  UserOutlined,
  TrophyOutlined,
  BookOutlined,
  FireOutlined,
  StarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SettingOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"
import "../css/Profile.css"
import axios from "axios"
import { useNavigate } from "react-router-dom"

interface UserProfile {
  username: string
  email: string
  joinDate: string
  totalScore: number
  rank: number
  completed: number
  inProgress: number
  streak: number
  hoursStudied: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon?: string
  earned: boolean
  earnedDate?: string
}

const ProfilePage: React.FC = () => {
  const { user } = useUserStore()
  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    email: "",
    joinDate: "",
    totalScore: 0,
    rank: 0,
    completed: 0,
    inProgress: 0,
    streak: 0,
    hoursStudied: 0,
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const URL = import.meta.env.VITE_API_URL
  const navigate = useNavigate()
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)

        // Get username from localStorage or UserStore
        const storedUsername = localStorage.getItem("username") || user?.user || "Explorer"

        // Mock profile data - in real app, this would come from API
        const mockProfile: UserProfile = {
          username: storedUsername,
          email: `${storedUsername.toLowerCase()}@rpgpy.com`,
          joinDate: "January 2024",
          totalScore: 1250,
          rank: 8,
          completed: 5,
          inProgress: 3,
          streak: 7,
          hoursStudied: 42,
        }

        const userAchievementData = await axios.get(`${URL}/achievements/user`, { params: { uid: user?.uid }, withCredentials: true })

          // UserId: x  , "AchievementId":[ {} ]

        const mockAchievements: Achievement[] = userAchievementData.data.achievements.map((item:any)=>(
          {
            id: item.id,
            title: item.name,
            description: item.details,
            earned: item.earned,
          }
        ))


        // const mockAchievements: Achievement[] = [
        //   {
        //     id: "1",
        //     title: "First Steps",
        //     description: "Complete your first Python adventure",
        //     icon: "🎯",
        //     earned: true,
        //     earnedDate: "2024-01-15",
        //   },
        //   {
        //     id: "2",
        //     title: "Code Warrior",
        //     description: "Complete 5 adventures",
        //     icon: "⚔️",
        //     earned: true,
        //     earnedDate: "2024-02-20",
        //   },
        //   {
        //     id: "3",
        //     title: "Streak Master",
        //     description: "Maintain a 7-day learning streak",
        //     icon: "🔥",
        //     earned: true,
        //     earnedDate: "2024-03-01",
        //   },
        //   {
        //     id: "4",
        //     title: "Top Performer",
        //     description: "Reach top 10 on leaderboard",
        //     icon: "🏆",
        //     earned: true,
        //     earnedDate: "2024-03-10",
        //   },
        //   {
        //     id: "5",
        //     title: "Python Master",
        //     description: "Complete 10 adventures",
        //     icon: "🐍",
        //     earned: false,
        //   },
        //   {
        //     id: "6",
        //     title: "Community Helper",
        //     description: "Help 5 other learners",
        //     icon: "🤝",
        //     earned: false,
        //   },
        // ]

        setProfile(mockProfile)
        setAchievements(mockAchievements)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching profile data:", error)
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    )
  }

  const completionPercentage = Math.round((profile.completed / (profile.completed + profile.inProgress + 2)) * 100)

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <img
              src={`/user-avatar-for-.png?height=120&width=120&query=user avatar for ${profile.username}`}
              alt={`${profile.username} avatar`}
              className="profile-avatar-image"
            />
            <div className="profile-avatar-fallback">
              <UserOutlined />
            </div>
          </div>
          <button className="edit-avatar-btn">
            <EditOutlined />
          </button>
        </div>

        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="profile-name">{profile.username}</h1>
            <button className="edit-profile-btn">
              <EditOutlined /> Edit Profile
            </button>
          </div>
          <p className="profile-tagline">Python Learning Adventurer</p>
          <div className="profile-meta">
            <div className="meta-item">
              <CalendarOutlined />
              <span>Joined {profile.joinDate}</span>
            </div>
            <div className="meta-item">
              <ClockCircleOutlined />
              <span>{profile.hoursStudied} hours studied</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-section">
        <div className="stat-card primary">
          <div className="stat-content">
            <div className="stat-icon-wrapper primary">
              <TrophyOutlined className="stat-icon" />
            </div>
            <div className="stat-details">
              <h3 className="stat-value">{profile.totalScore.toLocaleString()}</h3>
              <p className="stat-label">Total Score</p>
            </div>
            <div className="stat-progress">
              <div className="circular-progress">
                <svg className="progress-ring" width="60" height="60">
                  <circle
                    className="progress-ring-circle"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    r="26"
                    cx="30"
                    cy="30"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 26}`,
                      strokeDashoffset: `${2 * Math.PI * 26 * (1 - 0.75)}`,
                    }}
                  />
                </svg>
                <span className="progress-text">75%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-content">
            <div className="stat-icon-wrapper secondary">
              <StarOutlined className="stat-icon" />
            </div>
            <div className="stat-details">
              <h3 className="stat-value">#{profile.rank}</h3>
              <p className="stat-label">Global Rank</p>
            </div>
            <div className="stat-progress">
              <div className="circular-progress">
                <svg className="progress-ring" width="60" height="60">
                  <circle
                    className="progress-ring-circle"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    r="26"
                    cx="30"
                    cy="30"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 26}`,
                      strokeDashoffset: `${2 * Math.PI * 26 * (1 - 0.9)}`,
                    }}
                  />
                </svg>
                <span className="progress-text">90%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-content">
            <div className="stat-icon-wrapper accent">
              <CheckCircleOutlined className="stat-icon" />
            </div>
            <div className="stat-details">
              <h3 className="stat-value">{profile.completed}</h3>
              <p className="stat-label">Completed</p>
            </div>
            <div className="stat-progress">
              <div className="circular-progress">
                <svg className="progress-ring" width="60" height="60">
                  <circle
                    className="progress-ring-circle"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    r="26"
                    cx="30"
                    cy="30"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 26}`,
                      strokeDashoffset: `${2 * Math.PI * 26 * (1 - 0.85)}`,
                    }}
                  />
                </svg>
                <span className="progress-text">85%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card streak">
          <div className="stat-content">
            <div className="stat-icon-wrapper streak">
              <FireOutlined className="stat-icon" />
            </div>
            <div className="stat-details">
              <h3 className="stat-value">{profile.streak}</h3>
              <p className="stat-label">Day Streak</p>
            </div>
            <div className="stat-progress">
              <div className="circular-progress">
                <svg className="progress-ring" width="60" height="60">
                  <circle
                    className="progress-ring-circle"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    r="26"
                    cx="30"
                    cy="30"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 26}`,
                      strokeDashoffset: `${2 * Math.PI * 26 * (1 - 0.7)}`,
                    }}
                  />
                </svg>
                <span className="progress-text">70%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="progress-card">
        <div className="progress-header">
          <h2 className="progress-title">
            <BookOutlined />
            Learning Progress
          </h2>
        </div>
        <div className="progress-content">
          <div className="progress-overview">
            <div className="progress-stats">
              <div className="progress-stat">
                <span className="progress-number">{profile.completed}</span>
                <span className="progress-label">Completed</span>
              </div>
              <div className="progress-stat">
                <span className="progress-number">{profile.inProgress}</span>
                <span className="progress-label">In Progress</span>
              </div>
              <div className="progress-stat">
                <span className="progress-number">{completionPercentage}%</span>
                <span className="progress-label">Overall</span>
              </div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
              </div>
              <span className="progress-percentage">{completionPercentage}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-card">
        <div className="achievements-header">
          <h2 className="achievements-title">
            <TrophyOutlined />
            Achievements
            <span className="achievements-count">
              {achievements.filter((a) => a.earned).length} of {achievements.length}
            </span>
          </h2>
        </div>
        <div className="achievements-content">
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`achievement-item ${achievement.earned ? "earned" : "locked"}`}>
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h4 className="achievement-title">{achievement.title}</h4>
                  <p className="achievement-description">{achievement.description}</p>
                  {achievement.earned && achievement.earnedDate && (
                    <span className="achievement-date">
                      Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {achievement.earned && (
                  <div className="achievement-badge">
                    <CheckCircleOutlined />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <div className="profile-actions">
        <button className="settings-btn" onClick={()=>{navigate("/settings")}}>
          <SettingOutlined />
           Settings
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
