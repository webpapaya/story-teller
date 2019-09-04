import { configure } from '@storybook/react';
import '../src/theme.css'

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}

function loadStories() {
  requireAll(require.context("../src", true, /.stories\.tsx?$/));
}

configure(loadStories, module);
