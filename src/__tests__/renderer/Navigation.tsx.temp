import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter, faSlidersH, faFolderOpen, faCog, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import NavigationComponent from '../../renderer/Navigation';

describe('NavigationComponent', () => {

  let toggleDrawerMock: () => void;

  beforeAll(() => {
    toggleDrawerMock = jest.fn();
  });	

  it('renders without errors', () => {
    render(<NavigationComponent toggleDrawer={toggleDrawerMock} />);
  });

  it('renders the Sleek title', () => {
    const { getByText } = render(<NavigationComponent toggleDrawer={toggleDrawerMock} />);
    expect(getByText('sleek')).toBeInTheDocument();
  });

  it('renders the add button with the plus icon', () => {
    const { getByTestId } = render(<NavigationComponent toggleDrawer={toggleDrawerMock} />);
    const addButton = getByTestId('navigation-button-add');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toContainElement(getByTestId('fa-icon-plus'));
  });

  it('calls the toggleDrawer function when the filter button is clicked', () => {
    const { getByTestId } = render(<NavigationComponent toggleDrawer={toggleDrawerMock} />);
    const filterButton = getByTestId('navigation-button-filter');
    fireEvent.click(filterButton);
    expect(toggleDrawerMock).toHaveBeenCalledTimes(1);
  });

  it('calls the toggleDrawer function when the view button is clicked', () => {
    const { getByTestId } = render(<NavigationComponent toggleDrawer={toggleDrawerMock} />);
    const viewButton = getByTestId('navigation-button-view');
    fireEvent.click(viewButton);
    expect(toggleDrawerMock).toHaveBeenCalledTimes(2);
  });

  it('renders the files button with the folder open icon', () => {
    const { getByTestId } = render(<NavigationComponent toggleDrawer={toggleDrawerMock} />);
    const filesButton = getByTestId('navigation-button-files');
    expect(filesButton).toBeInTheDocument();
    expect(filesButton).toContainElement(getByTestId('fa-icon-folder-open'));
  });

  it('renders the settings button with the cog icon and "bottom" class', () => {
    const { getByTestId } = render(<NavigationComponent toggleDrawer={toggleDrawerMock} />);
    const settingsButton = getByTestId('navigation-button-settings');
    expect(settingsButton).toBeInTheDocument();
    expect(settingsButton).toContainElement(getByTestId('fa-icon-cog'));
    expect(settingsButton).toHaveClass('bottom');
  });

  it('renders the help button with the question circle icon', () => {
    const { getByTestId } = render(<NavigationComponent toggleDrawer={toggleDrawerMock} />);
    const helpButton = getByTestId('navigation-button-help');
    expect(helpButton).toBeInTheDocument();
    expect(helpButton).toContainElement(getByTestId('fa-icon-question-circle'));
  });
});
