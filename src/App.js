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

        <List
          list={this.state.hits}
        />
      </div>
    );
  }
}

const List = ({ list }) =>
  <div>
    {list.map(item => <div key={item.objectID}>{item.title}</div>)}
  </div>

export default App;
