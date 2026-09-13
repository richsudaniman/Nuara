import AdminAnalytics from './pages/AdminAnalytics';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminClientAssignments from './pages/AdminClientAssignments';
import AdminDashboard from './pages/AdminDashboard';
import AdminEducationalContent from './pages/AdminEducationalContent';
import AdminInviteUser from './pages/AdminInviteUser';
import AdminSettings from './pages/AdminSettings';
import AdminUsers from './pages/AdminUsers';
import AdminVideos from './pages/AdminVideos';
import DiagnosticTool from './pages/DiagnosticTool';
import Exercises from './pages/Exercises';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Messages from './pages/Messages';
import Progress from './pages/Progress';
import SwitchRole from './pages/SwitchRole';
import TrainerAssignClients from './pages/TrainerAssignClients';
import TrainerClientDetail from './pages/TrainerClientDetail';
import TrainerClients from './pages/TrainerClients';
import TrainerDashboard from './pages/TrainerDashboard';
import TrainerMessages from './pages/TrainerMessages';
import TrainerVideos from './pages/TrainerVideos';
import MockMessages from './pages/MockMessages';
import TrainerClientsList from './pages/TrainerClientsList';
import HomeworkBuilder from './pages/HomeworkBuilder';
import Recordings from './pages/Recordings';
import ProgressGoals from './pages/ProgressGoals';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminAnalytics": AdminAnalytics,
    "AdminAnnouncements": AdminAnnouncements,
    "AdminClientAssignments": AdminClientAssignments,
    "AdminDashboard": AdminDashboard,
    "AdminEducationalContent": AdminEducationalContent,
    "AdminInviteUser": AdminInviteUser,
    "AdminSettings": AdminSettings,
    "AdminUsers": AdminUsers,
    "AdminVideos": AdminVideos,
    "DiagnosticTool": DiagnosticTool,
    "Exercises": Exercises,
    "Home": Home,
    "Learn": Learn,
    "Messages": Messages,
    "Progress": Progress,
    "SwitchRole": SwitchRole,
    "TrainerAssignClients": TrainerAssignClients,
    "TrainerClientDetail": TrainerClientDetail,
    "TrainerClients": TrainerClients,
    "TrainerDashboard": TrainerDashboard,
    "TrainerMessages": TrainerMessages,
    "TrainerVideos": TrainerVideos,
    "MockMessages": MockMessages,
    "TrainerClientsList": TrainerClientsList,
    "HomeworkBuilder": HomeworkBuilder,
    "Recordings": Recordings,
    "ProgressGoals": ProgressGoals,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};