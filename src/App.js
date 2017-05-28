import React from 'react';
import { compose } from 'recompose';

import './App.css';

const applyUpdateResult = (result) => (prevState) => ({
  hits: [...prevState.hits, ...result.hits],
  page: result.page,
  isError: false,
  isLoading: false,
});

const applySetResult = (result) => (prevState) => ({
  hits: result.hits,
  page: result.page,
  isError: false,
  isLoading: false,
});

const applySetError = (prevState) => ({
  isError: true,
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
      isError: false,
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
    this.fetchStories(this.input.value, this.state.page + 1);

  fetchStories = (value, page) => {
    this.setState({ isLoading: true });
    fetch(getHackerNewsUrl(value, page))
      .catch(this.onSetError)
      .then(response => response.json())
      .then(result => this.onSetResult(result, page));
  }

  onSetResult = (result, page) =>
    page === 0
      ? this.setState(applySetResult(result))
      : this.setState(applyUpdateResult(result));

  onSetError = () =>
    this.setState(applySetError);

  render() {
    return (
      <div className="page">
        <div className="interactions">
          <form type="submit" onSubmit={this.onInitialSearch}>
            <input type="text" ref={node => this.input = node} />
            <button type="button">Search</button>
          </form>
        </div>

        <AdvancedList
          list={this.state.hits}
          isError={this.state.isError}
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

const withLoading = (conditionFn) => (Component) => (props) =>
  <div>
    <Component {...props} />

    <div className="interactions">
      {conditionFn(props) && <span>Loading...</span>}
    </div>
  </div>

const withPaginated = (conditionFn) => (Component) => (props) =>
  <div>
    <Component {...props} />

    <div className="interactions">
      {
        conditionFn(props) &&
        <div>
          <div>
            Something went wrong...
          </div>
          <button
            type="button"
            onClick={props.onPaginatedSearch}
          >
            Try Again
          </button>
        </div>
      }
    </div>
  </div>

const withInfiniteScroll = (conditionFn) => (Component) =>
  class WithInfiniteScroll extends React.Component {
    componentDidMount() {
      window.addEventListener('scroll', this.onScroll, false);
    }

    componentWillUnmount() {
      window.removeEventListener('scroll', this.onScroll, false);
    }

    onScroll = () =>
      conditionFn(this.props) && this.props.onPaginatedSearch();

    render() {
      return <Component {...this.props} />;
    }
  }

const paginatedCondition = props =>
  props.page !== null && !props.isLoading && props.isError;

const infiniteScrollCondition = props =>
  (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500)
  && props.list.length
  && !props.isLoading
  && !props.isError;

const loadingCondition = props =>
  props.isLoading;

const AdvancedList = compose(
  withPaginated(paginatedCondition),
  withInfiniteScroll(infiniteScrollCondition),
  withLoading(loadingCondition),
)(List);

export default App;
