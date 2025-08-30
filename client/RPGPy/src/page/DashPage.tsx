
import { useUserStore } from '../../components/UserStore';
import '../css/Dashboard.css';
import { Row, Col, Card, Progress, Button } from 'antd';

// Sample data for the dashboard
const adventures = [
  { id: 1, title: 'Python for Beginners', progress: 60 },
  { id: 2, title: 'Data Structures in Java', progress: 35 },
  { id: 3, title: 'Web Development with React', progress: 80 },
];

const leaderboard = [
  { id: 1, name: 'Player1', score: 1500 },
  { id: 2, name: 'Player2', score: 1200 },
  { id: 3, name: 'You', score: 1100 },
  { id: 4, name: 'Player4', score: 900 },
];

const announcements = [
    { id: 1, text: 'New "Advanced Python" adventure released!' },
    { id: 2, text: 'Scheduled maintenance on Sunday at 2 AM.' },
];

export default function DashPage() {
  const { user } = useUserStore();

  return (
    <div className="dashboard-container-dark">
      <div className="dashboard-header-dark">
        <h1 className="welcome-title-dark">Welcome Back, {user || 'Player'}!</h1>
        <p className="welcome-subtitle-dark">Your journey continues...</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="My Adventures" bordered={false} className="dashboard-card-dark">
            {adventures.map(adv => (
              <div key={adv.id} className="adventure-item-dark">
                <p>{adv.title}</p>
                <Progress percent={adv.progress} status="active" />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Leaderboard" bordered={false} className="dashboard-card-dark">
            <ul className="leaderboard-list-dark">
              {leaderboard.map(player => (
                <li key={player.id} className={player.name === 'You' ? 'leaderboard-user-dark' : ''}>
                  <span>{player.name}</span>
                  <span>{player.score}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Daily Quest" bordered={false} className="dashboard-card-dark">
            <p>Complete 3 lessons in "Python for Beginners" to earn 50 gems!</p>
            <Button type="primary" block>Start Quest</Button>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Announcements" bordered={false} className="dashboard-card-dark">
            <ul className="announcements-list-dark">
              {announcements.map(ann => (
                <li key={ann.id}>{ann.text}</li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
