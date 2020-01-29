import React from 'react';
import PropTypes from 'prop-types';
import {
  INFO,
  WARNING,
  ERROR,
} from "unchained-wallets";
import { 
  Box, Typography, 
  Tabs, Tab, Paper,
  List, ListItem, ListItemIcon, ListItemText,
} from '@material-ui/core';
import { Info, Warning, Error } from '@material-ui/icons';

import "./InteractionMessages.css";

class MessagesList extends React.Component {

  static propTypes = {
    messages: PropTypes.array.isRequired,
  };

  render = () => {
    const {messages} = this.props;
    return (
      <List style={{maxHeight: '400px', overflow: 'auto'}} dense>
        {messages.map(this.renderMessage)}
      </List>
    );
  }

  renderMessage = (message, key) => {
    return (
      <ListItem key={key}>
        {message.level && 
         <ListItemIcon>
           {this.messageIcon(message)}
         </ListItemIcon>}
        <ListItemText>
          {this.renderMessageBodyAndSubmessages(message)}
        </ListItemText>
      </ListItem>
    );
  }

  renderMessageBodyAndSubmessages = (message) => {
    return (
      <Box>
        {this.renderMessageBody(message)}
        {message.messages && 
         <List dense>
           {message.messages.map(this.renderMessage)}
         </List>}
      </Box>
    );
  }

  renderMessageBody = (message) => {
    return (
      <Box>
        {message.image && <Box align="center"><img className="InteractionMessages-image" src={`data:${message.image.mimeType};base64, ${message.image.data}`} alt={message.image.label} /></Box>}
        <p>{message.text}</p>
      </Box>
    );
  }

  messageIcon = (message) => {
    switch (message.level) {
    case INFO:
      return <Info />;
    case WARNING:
      return <Warning />;
    case ERROR:
      return <Error />;
    default:
      return null;
    }    
  }
  
}

class VersionTabPanel extends React.Component {

  static propTypes = {
    messages: PropTypes.array.isRequired,
    version: PropTypes.string.isRequired,
    currentVersion: PropTypes.string.isRequired,
  };

  render = () => {
    const {version, currentVersion} = this.props;
    return (
      <Box 
        role="tabpanel"
        hidden={version !== currentVersion} 
        id={`interactionMessages-tabpanel-${version}`} 
        aria-labelledby={`interactionMessages-tab-${version}`}>
        {version === currentVersion && <MessagesList messages={this.filteredMessages()} />}
      </Box>
    );
  }

  filteredMessages = () => {
    const {messages, version} = this.props;
    return messages.filter((message) => {
      if (message.version) {
        return (message.version === version);
      } else {
        return true;
      }
    });
  }

}

class InteractionMessages extends React.Component {

  static propTypes = {
    messages: PropTypes.array.isRequired,
    excludeCodes: PropTypes.array.isRequired,
  };

  static defaultProps = {
    messages: [],
    excludeCodes: [],
  }

  state = {
    currentVersion: '',
  };

  render = () => {
    const {messages, versions} = this.filteredMessages();
    const currentVersion = this.currentVersion(versions);
    if (versions.length < 2) {
      return (<MessagesList messages={messages} />);
    } else {
      return (
        <Box>
          <Typography variant="h6">
            Version
          </Typography>
          <Paper square>
            <Tabs value={currentVersion} onChange={this.handleChange} aria-label="interactionMessages-version">
              {versions.map((version, i) => <Tab key={i} value={version} label={version} id={`interactionMessages-tab-${version}`} aria-controls={`interactionMessages-tabpanel-${version}`}/>)}
            </Tabs>
          </Paper>
          {versions.map((version, i) => (<VersionTabPanel key={i} version={version} currentVersion={currentVersion} messages={messages} />))}
        </Box>
      );
    }
  }

  currentVersion = (versions) => {
    const {currentVersion} = this.state;
    if (currentVersion) {
      return currentVersion;
    } else {
      return versions[versions.length -1];
    }
  }

  handleChange = (event, newValue) => {
    this.setState({currentVersion: newValue});
  }

  filteredMessages = () => {
    const {messages, excludeCodes} = this.props;
    let filteredMessages = [];
    let versions = [];
    messages.forEach((message) => {
      for (let i=0; i < excludeCodes.length; i++) {
        const excludeCode = excludeCodes[i];
        if ((message.code || '').includes(excludeCode)) { return; }
      }
      filteredMessages.push(message);
      if (message.version && (!versions.includes(message.version))) {
        versions.push(message.version);
      }
    });
    return {versions, messages: filteredMessages};
  }
}

export default InteractionMessages;
