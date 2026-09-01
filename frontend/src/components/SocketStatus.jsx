import { useSocket } from '../context/SocketContext';
import './SocketStatus.css';

export default function SocketStatus() {
  const { connected } = useSocket();

  return (
    <div className={`socket-status ${connected ? 'connected' : 'disconnected'}`}>
      <span className="status-dot"></span>
      <span className="status-text">
        {connected ? 'Live Updates Active' : 'Reconnecting...'}
      </span>
    </div>
  );
}
