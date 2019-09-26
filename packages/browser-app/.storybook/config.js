import { configure } from '@storybook/react';
import './addons'
import '../src/theme.css'

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

function loadStories() {
  requireAll(require.context("../src", true, /.stories\.tsx?$/));
}

configure(loadStories, module);
