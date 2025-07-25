import React, { useState} from 'react';
import './settings.css';

interface SettingsProps {
  userName: string;
  setUserName: (name: string) => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const Settings: React.FC<SettingsProps> = ({ userName, setUserName, showNotification }) => {
  const [localUserName, setLocalUserName] = useState(userName);
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalUserName(e.target.value);
  };
  
  const handleSave = () => {
    setUserName(localUserName);
    localStorage.setItem('userName', localUserName);
    console.log('Settings saved:', { userName: localUserName});
    showNotification('Settings Saved!', 'success');
  };

  const handleExportData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/export_data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memory_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showNotification('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Failed to export data.', 'error');
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      try {
        const response = await fetch('http://127.0.0.1:8000/clear_data', {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        showNotification(result.message, 'success');
      } catch (error) {
        console.error('Error clearing data:', error);
        showNotification('Failed to clear data.', 'error');
      }
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Customize your MindWell experience.</p>
      </div>
      <div className="settings-grid">
        <div className="settings-card">
          <h3>Profile</h3>
          <div className="setting-item">
            <label htmlFor="userName">Your Name</label>
            <input
              type="text"
              id="userName"
              value={localUserName}
              onChange={handleNameChange}
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div className="settings-card">
          <h3>Data Management</h3>
          <div className="setting-item">
            <button className="btn btn-secondary" onClick={handleExportData}>Export My Data</button>
          </div>
          <div className="setting-item">
            <button className="btn btn-danger" onClick={handleClearData}>Clear All Data</button>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button className="btn btn-primary" onClick={handleSave}>Save All Settings</button>
      </div>
    </div>
  );
};

export default Settings;
