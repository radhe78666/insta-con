import React from 'react';
import { User } from '../types';
import ComingSoon from './ComingSoon';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return <ComingSoon title={`Welcome, ${user.name.split(' ')[0]}`} />;
};

export default Dashboard;
