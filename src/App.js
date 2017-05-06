import React from 'react';

const applySetResult = (result) => (prevState) => ({
  hits: [...prevState.hits, ...result.hits],
  page: result.page,
});

const getHackerNewsUrl = (value, page) =>
  `https://hn.algolia.com/api/v1/search?query=${value}&page=${page}&hitsPerPage=100`;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hits: [],
      page: null,
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

  fetchStories = (value, page) =>
    fetch(getHackerNewsUrl(value, page))
      .then(response => response.json())
      .then(result => this.onSetResult(result));

  onSetResult = (result) =>
    this.setState(applySetResult(result));

  render() {
    return (
      <div>
        <h1>Search Hacker News</h1>

        <form type="submit" onSubmit={this.onInitialSearch}>
          <input type="text" ref={node => this.input = node} />
          <button type="button">Search</button>
        </form>

        <ListWithInfiniteScroll
          list={this.state.hits}
          page={this.state.page}
          onPaginatedSearch={this.onPaginatedSearch}
        />
      </div>
    );
  }
}

const withPaginate = (Component) => ({ page, onPaginatedSearch, ...props }) =>
  <div>
    <Component { ...props } />

    {
        page !== null &&
        <button
          type="button"
          onClick={onPaginatedSearch}
        >
          More
        </button>
      }
  </div>

const withInfiniteScroll = (Component) =>
  class WithInfiniteScroll extends React.Component {
    constructor(props) {
      super(props);
      this.onScroll = this.onScroll.bind(this);
    }

    componentDidMount() {
      window.addEventListener('scroll', this.onScroll, false);
    }

    componentWillUnmount() {
      window.removeEventListener('scroll', this.onScroll, false);
    }

    onScroll() {
      if (
        (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 500) &&
        this.props.page !== null
      ) {
        this.props.onPaginatedSearch();
      }
    }

    render() {
      return <Component {...this.props} />;
    }
  }

class List extends React.Component {
  render() {
    const { list } = this.props;
    return (
      <div>
        {list.map(item => <div key={item.objectID}>{item.title}</div>)}
      </div>
    );
  }
}

const ListWithPaginate = withPaginate(List);
const ListWithInfiniteScroll = withInfiniteScroll(List);

export default App;
