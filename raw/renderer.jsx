'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const Mine = require(`${__dirname}/mine`);

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(
      <Mine/>,
      document.getElementById('mine-root')
    );
});
