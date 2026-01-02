import AdminAnalytics from './pages/AdminAnalytics';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminClientAssignments from './pages/AdminClientAssignments';
import AdminDashboard from './pages/AdminDashboard';
import AdminEducationalContent from './pages/AdminEducationalContent';
import AdminInviteUser from './pages/AdminInviteUser';
import AdminTrainers from './pages/AdminTrainers';
import AdminUsers from './pages/AdminUsers';
import AdminVideos from './pages/AdminVideos';
import DiagnosticTool from './pages/DiagnosticTool';
import Exercises from './pages/Exercises';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Messages from './pages/Messages';
import PainTracking from './pages/PainTracking';
import Progress from './pages/Progress';
import SwitchRole from './pages/SwitchRole';
import TrainerAssignClients from './pages/TrainerAssignClients';
import TrainerClientDetail from './pages/TrainerClientDetail';
import TrainerClients from './pages/TrainerClients';
import TrainerDashboard from './pages/TrainerDashboard';
import TrainerMessages from './pages/TrainerMessages';
import TrainerVideos from './pages/TrainerVideos';
import MockMessages from './pages/MockMessages';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminAnalytics": AdminAnalytics,
    "AdminAnnouncements": AdminAnnouncements,
    "AdminClientAssignments": AdminClientAssignments,
    "AdminDashboard": AdminDashboard,
    "AdminEducationalContent": AdminEducationalContent,
    "AdminInviteUser": AdminInviteUser,
    "AdminTrainers": AdminTrainers,
    "AdminUsers": AdminUsers,
    "AdminVideos": AdminVideos,
    "DiagnosticTool": DiagnosticTool,
    "Exercises": Exercises,
    "Home": Home,
    "Learn": Learn,
    "Messages": Messages,
    "PainTracking": PainTracking,
    "Progress": Progress,
    "SwitchRole": SwitchRole,
    "TrainerAssignClients": TrainerAssignClients,
    "TrainerClientDetail": TrainerClientDetail,
    "TrainerClients": TrainerClients,
    "TrainerDashboard": TrainerDashboard,
    "TrainerMessages": TrainerMessages,
    "TrainerVideos": TrainerVideos,
    "MockMessages": MockMessages,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};