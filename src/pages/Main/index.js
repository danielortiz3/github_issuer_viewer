import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner, FaTrash } from 'react-icons/fa';

import { Link } from 'react-router-dom';

import { Form, SubmitButton, List, Message, DeleteButton } from './styles';
import Container from '../../components/Container';
import api from '../../services/api';

export default class Main extends Component {
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: false,
    message: ''
  };

  // Load data from localstorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories)
      this.setState({
        repositories: JSON.parse(repositories)
      });
  }

  // Save data to localstorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleDelete(repository) {
    //const { repositories } = this.state;
    this.setState(prevState => ({
      repositories: prevState.repositories.filter(repos => repos.name !== repository)
    }))

    console.log(repository);

  };

  handleInputChange = e => {
    this.setState({
      newRepo: e.target.value
    });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    const { newRepo, repositories } = this.state;

    try {
      if (newRepo === '') {
        this.setState({
          message: 'You must enter a valid GitHub repository.'
        });
        throw new Error('You must enter a valid GitHub repository.');
      }

      const repoExistis = repositories.find(r => r.name === newRepo);
      if (repoExistis) {
        this.setState({
          message: 'This repository has been already added'
        });
        throw new Error('This repository has been already added');
      }

      const response = await api.get(`repos/${newRepo}`);
      // console.log(response.request.status);
      const data = {
        name: response.data.full_name
      };

      this.setState({
        newRepo: '',
        repositories: [...repositories, data],
        loading: false,
        error: false,
        message: ''
      });
    } catch (err) {
      this.setState({
        loading: false,
        error: true,
        message: err.message
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, error, message } = this.state;
    return (
      <>
        <Container>
          <h1>
            <FaGithubAlt />
            Repositories
          </h1>

          <Form onSubmit={this.handleSubmit} error={error}>
            <input
              type="text"
              placeholder="Add Repository"
              value={newRepo}
              onChange={this.handleInputChange}
            />
            <SubmitButton loading={loading ? 1 : 0}>
              {loading ? (
                <FaSpinner color="#FFF" size={14} />
              ) : (
                <FaPlus color="#FFF" size={14} />
              )}
            </SubmitButton>
          </Form>

          <Message>{message}</Message>

          <List>
            {repositories.map(repo => (
              <li key={repo.name}>
                <span>{repo.name}</span>
                <div>
                  <Link to={`/repository/${encodeURIComponent(repo.name)}`}>
                    Details
                  </Link>
                  <DeleteButton onClick={() => this.handleDelete(repo.name)}>
                    <FaTrash />
                  </DeleteButton>
                </div>
              </li>
            ))}
          </List>
        </Container>
      </>
    );
  }
}
