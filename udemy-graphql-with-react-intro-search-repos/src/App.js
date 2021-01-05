import React, { useState } from 'react';
import { ApolloProvider, Query } from 'react-apollo';
import client from './client';
import { SEARCH_REPOSITORIES } from "./graphql";

const DEFAULT_STATE = {
  first: 5,
  after:null,
  last: null,
  before: null,
  query: "フロントエンドエンジニア"
};

function App() {
  const [variables, setVariables] = useState(DEFAULT_STATE);
  const { query, first, last, before, after } = variables;
  console.log({query})
  function handleChange(input) {
    setVariables({
      ...DEFAULT_STATE,
      query: input.target.value
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

            console.log({data});
            return <div></div>
          }
        }
      </Query>
    </ApolloProvider>
  );
}

export default App;
