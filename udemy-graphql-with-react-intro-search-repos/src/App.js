import React, { useState } from 'react';
import { ApolloProvider, Query, Mutation } from 'react-apollo';
import client from './client';
import { SEARCH_REPOSITORIES, ADD_STAR, REMOVE_STAR } from "./graphql";

const PER_PAGE = 5;
const DEFAULT_STATE = {
  first: PER_PAGE,
  after:null,
  last: null,
  before: null,
  query: "フロントエンドエンジニア"
};

const StarButton = props => {
  const { node, query, first, last, before, after } = props;
  const totalCount = node.stargazers.totalCount;
  const unit = totalCount === 1 ? 'star' : 'stars';
  const viewerHasStarred = node.viewerHasStarred;
  const starText = `${totalCount} ${unit}`;
  const StarStatus = ({addOrRemoveStar}) => {
    return (
      <button
      onClick={
        () => {
          addOrRemoveStar({
            variables: { input: { starrableId: node.id } }
          })
        }
      }
      >
        {starText} | {viewerHasStarred ? 'starred' : '-'}
      </button>
    )
  }

  return (
    <Mutation 
      mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
      refetchQueries={
        [
          {
            query: SEARCH_REPOSITORIES,
            variables: { query, first, last, before, after }
          }
        ]
      }
    >
      {
        addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar}/>
      }
    </Mutation>
  )
}

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
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null
    });
  }

  function goPrevious(search) {
    setVariables({
      ...variables,
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor
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
                          &nbsp;
                          <StarButton node={node} {...{ query, first, last, before, after }}></StarButton>
                        </li>
                      )
                    })
                  }
                </ul>

                {
                  search.pageInfo.hasPreviousPage === true ?
                  <button
                    onClick={() => goPrevious(search)}
                  >
                    Previous
                  </button>
                  :
                  null
                }
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
