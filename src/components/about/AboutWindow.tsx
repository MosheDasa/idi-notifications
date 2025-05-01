import React, { useEffect, useState } from "react";
import "./AboutWindow.css";

interface Config {
  API_URL: string;
  API_POLLING_INTERVAL: number;
  LOG: boolean;
  userId: string;
}

const AboutWindow: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    // Listen for config data from main process
    window.electron.ipcRenderer.on(
      "about-data",
      (data: { config: Config; version: string }) => {
        setConfig(data.config);
        setVersion(data.version);
      }
    );

    // Request config data
    window.electron.ipcRenderer.send("get-about-data");

    return () => {
      window.electron.ipcRenderer.removeAllListeners("about-data");
    };
  }, []);

  if (!config) {
    return <div className="about-window">Loading...</div>;
  }

  return (
    <div className="about-window">
      <h2>IDI Notifications</h2>
      <p className="version">Version {version}</p>

      <div className="config-section">
        <h3>Configuration</h3>
        <table>
          <tbody>
            <tr>
              <td>Server URL:</td>
              <td>{config.API_URL}</td>
            </tr>
            <tr>
              <td>Polling Interval:</td>
              <td>{config.API_POLLING_INTERVAL}ms</td>
            </tr>
            <tr>
              <td>Logging Enabled:</td>
              <td>{config.LOG ? "Yes" : "No"}</td>
            </tr>
            <tr>
              <td>User ID:</td>
              <td>{config.userId}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AboutWindow;
