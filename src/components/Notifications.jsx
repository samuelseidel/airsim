import useGameStore from '../store/gameStore';
import './Notifications.css';

export default function Notifications() {
  const notifications = useGameStore(state => state.notifications);

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      ))}
    </div>
  );
}
