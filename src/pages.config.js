import Home from './pages/Home';
import Workout from './pages/Workout';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress';
import Learn from './pages/Learn';
import TrainerClients from './pages/TrainerClients';
import TrainerDashboard from './pages/TrainerDashboard';
import TrainerClientDetail from './pages/TrainerClientDetail';
import TrainerVideos from './pages/TrainerVideos';
import SwitchRole from './pages/SwitchRole';
import TrainerAssignClients from './pages/TrainerAssignClients';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTrainers from './pages/AdminTrainers';
import AdminVideos from './pages/AdminVideos';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminInviteUser from './pages/AdminInviteUser';
import AdminClientAssignments from './pages/AdminClientAssignments';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminEducationalContent from './pages/AdminEducationalContent';
import Messages from './pages/Messages';
import TrainerMessages from './pages/TrainerMessages';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Workout": Workout,
    "Nutrition": Nutrition,
    "Progress": Progress,
    "Learn": Learn,
    "TrainerClients": TrainerClients,
    "TrainerDashboard": TrainerDashboard,
    "TrainerClientDetail": TrainerClientDetail,
    "TrainerVideos": TrainerVideos,
    "SwitchRole": SwitchRole,
    "TrainerAssignClients": TrainerAssignClients,
    "AdminDashboard": AdminDashboard,
    "AdminUsers": AdminUsers,
    "AdminTrainers": AdminTrainers,
    "AdminVideos": AdminVideos,
    "AdminAnalytics": AdminAnalytics,
    "AdminInviteUser": AdminInviteUser,
    "AdminClientAssignments": AdminClientAssignments,
    "AdminAnnouncements": AdminAnnouncements,
    "AdminEducationalContent": AdminEducationalContent,
    "Messages": Messages,
    "TrainerMessages": TrainerMessages,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};