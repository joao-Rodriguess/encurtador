import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import LinkForm from '../components/LinkForm';
import LinkList from '../components/LinkList';

const DashboardPage = () => {
  const { user } = useOutletContext();

  return (
    <div>
      <Header user={user} />
      <main className="dashboard-main container">
        <LinkForm userId={user.uid} />
        <LinkList userId={user.uid} />
      </main>
    </div>
  );
};

export default DashboardPage;
