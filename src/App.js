import React from 'react';
import { compose } from 'recompose';

import './App.css';

const applySetResult = (result) => (prevState) => ({
  hits: [...prevState.hits, ...result.hits],
  page: result.page,
  isLoading: false,
});

const getHackerNewsUrl = (value, page) =>
  `https://hn.algolia.com/api/v1/search?query=${value}&page=${page}&hitsPerPage=100`;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hits: [],
      page: null,
      isLoading: false,
    };
  }

  onInitialSearch = (e) => {
    e.preventDefault();

    const { value } = this.input;

    if (value === '') {
      return;
    }

    this.fetchStories(value, 0);
  }

  onPaginatedSearch = (e) =>
    this.fetchStories(this.input.value, this.state.page + 1)

  fetchStories = (value, page) => {
    this.setState({ isLoading: true });
    fetch(getHackerNewsUrl(value, page))
      .then(response => response.json())
      .then(result => this.onSetResult(result));
  }

  onSetResult = (result) =>
    this.setState(applySetResult(result));

  render() {
    return (
      <div className="page">
        <div className="interactions">
          <form type="submit" onSubmit={this.onInitialSearch}>
            <input type="text" ref={node => this.input = node} />
            <button type="button">Search</button>
          </form>
        </div>

        <ListWithLoadingWithInfinite
          list={this.state.hits}
          isLoading={this.state.isLoading}
          page={this.state.page}
          onPaginatedSearch={this.onPaginatedSearch}
        />
      </div>
    );
  }
}

const List = ({ list }) =>
  <div className="list">
    {list.map(item => <div className="list-row" key={item.objectID}>
      <a href={item.url}>{item.title}</a>
    </div>)}
  </div>

const withLoading = (Component) => (props) =>
  <div>
    <Component {...props} />

    <div className="interactions">
      {props.isLoading && <span>Loading...</span>}
    </div>
  </div>

const withPaginated = (Component) => ({ page, onPaginatedSearch, ...rest }) =>
  <div>
    <Component {...rest} />

    <div className="interactions">
      {
        (page !== null && !rest.isLoading) &&
        <button
          type="button"
          onClick={onPaginatedSearch}
        >
          More
        </button>
      }
    </div>
  </div>

const withInfiniteScroll = (Component) =>
  class WithInfiniteScroll extends React.Component {
    componentDidMount() {
      window.addEventListener('scroll', this.onScroll, false);
    }

    componentWillUnmount() {
      window.removeEventListener('scroll', this.onScroll, false);
    }

    onScroll = () => {
      if (
        (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500) &&
        this.props.list.length &&
        !this.props.isLoading
      ) {
        this.props.onPaginatedSearch();
      }
    }

    render() {
      return <Component {...this.props} />;
    }
  }

const ListWithLoadingWithInfinite = compose(
  withLoading,
  // withPaginated,
  withInfiniteScroll,
)(List);

export default App;