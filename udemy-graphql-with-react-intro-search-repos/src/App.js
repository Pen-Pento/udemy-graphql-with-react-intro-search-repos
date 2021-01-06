import React, { useState } from 'react';
import { ApolloProvider, Query } from 'react-apollo';
import client from './client';
import { SEARCH_REPOSITORIES } from "./graphql";

const PER_PAGE = 5;
const DEFAULT_STATE = {
  first: PER_PAGE,
  after:null,
  last: null,
  before: null,
  query: "フロントエンドエンジニア"
};

function App() {
  const [variables, setVariables] = useState(DEFAULT_STATE);
  const { query, first, last, before, after } = variables;

  function handleChange(input) {
    setVariables({
      ...variables,
      query: input.target.value
    });
  }

  function goNext(search) {
    setVariables({
      ...variables,
      after: search.pageInfo.endCursor,
    });
  }

  return (
    <ApolloProvider client={client}>
      <form>
        <input value={query} onChange={handleChange}></input>
      </form>
      <Query
      query={SEARCH_REPOSITORIES}
      variables={{ query, first, last, before, after }}
      >
        {
          ({ loading, error, data }) => {
            if (loading) return 'Loading ...';
            if (error) return `Error! ${error.message}`;

            const search = data.search;
            const repositoryCount = search.repositoryCount;
            const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories';
            const title = `GitHub Repositories Search Results - ${repositoryCount} ${repositoryUnit}`;
            return (
              <React.Fragment>
                <h2>{title}</h2>
                <ul>
                  {
                    search.edges.map(edge => {
                      const node = edge.node;

                      return (
                        <li key={node.id}>
                          <a href={node.url} target="_blank" rel="noreferrer">{node.name}</a>
                        </li>
                      )
                    })
                  }
                </ul>

                {
                  search.pageInfo.hasNextPage === true ?
                  <button
                    onClick={() => goNext(search)}
                  >
                    Next
                  </button>
                  :
                  null
                }
              </React.Fragment>
          )}
        }
      </Query>
    </ApolloProvider>
  );
}

export default App;
