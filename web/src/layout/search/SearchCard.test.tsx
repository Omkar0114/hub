import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

import { Package } from '../../types';
import { prepareQueryString } from '../../utils/prepareQueryString';
import SearchCard from './SearchCard';

const getMockPackage = (fixtureId: string): Package => {
  return require(`./__fixtures__/SearchCard/${fixtureId}.json`) as Package;
};

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as {}),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('SearchCard', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', () => {
    const mockPackage = getMockPackage('1');
    const { asFragment } = render(
      <Router>
        <SearchCard package={mockPackage} />
      </Router>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  describe('Image', () => {
    it('renders package logo', () => {
      const mockPackage = getMockPackage('2');
      render(
        <Router>
          <SearchCard package={mockPackage} />
        </Router>
      );
      const image = screen.getByAltText(`Logo ${mockPackage.displayName}`);
      expect(image).toBeInTheDocument();
    });

    it('renders placeholder when imageId is null', () => {
      const mockPackage = getMockPackage('3');

      render(
        <Router>
          <SearchCard package={mockPackage} />
        </Router>
      );
      const image = screen.getByAltText(`Logo ${mockPackage.displayName}`);
      expect(image).toBeInTheDocument();
      expect((image as HTMLImageElement).src).toBe('http://localhost/static/media/placeholder_pkg_helm.png');
    });
  });

  describe('Title', () => {
    it('renders display name', () => {
      const mockPackage = getMockPackage('4');

      render(
        <Router>
          <SearchCard package={mockPackage} />
        </Router>
      );
      expect(screen.getByText(mockPackage.displayName!)).toBeInTheDocument();
    });

    it('renders name when display name is null', () => {
      const mockPackage = getMockPackage('5');

      render(
        <Router>
          <SearchCard package={mockPackage} />
        </Router>
      );
      expect(screen.getByText(mockPackage.name!)).toBeInTheDocument();
    });
  });

  describe('Repository button', () => {
    it('renders repository link', async () => {
      const mockPackage = getMockPackage('6');

      render(
        <Router>
          <SearchCard package={mockPackage} />
        </Router>
      );
      const buttons = screen.getAllByTestId('repoLink');
      expect(buttons).toHaveLength(2);
      const icons = screen.getAllByAltText('Icon');
      expect(icons).toHaveLength(12);
      expect(icons[0]).toBeInTheDocument();
      expect((icons[0] as HTMLImageElement).src).toBe('http://localhost/static/media/helm-chart.svg');
      await userEvent.click(buttons[0]!);

      await waitFor(() => {
        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/packages/search',
          search: prepareQueryString({
            pageNumber: 1,
            filters: {
              repo: [mockPackage.repository.name],
            },
          }),
        });
      });
    });

    it('renders user link', async () => {
      const mockPackage = getMockPackage('7');

      render(
        <Router>
          <SearchCard package={mockPackage} />
        </Router>
      );
      const button = screen.getByTestId('userLink');
      expect(button).toBeInTheDocument();
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/packages/search',
          search: prepareQueryString({
            pageNumber: 1,
            filters: {
              user: [mockPackage.repository.userAlias!],
            },
          }),
        });
      });
    });

    it('renders repo kind link', async () => {
      const mockPackage = getMockPackage('8');

      render(
        <Router>
          <SearchCard package={mockPackage} />
        </Router>
      );
      const buttons = screen.getAllByTestId('repoIconLabelLink');
      expect(buttons).toHaveLength(2);
      await userEvent.click(buttons[0]);

      await waitFor(() => {
        expect(mockHistoryPush).toHaveBeenCalledTimes(1);
        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/packages/search',
          search: prepareQueryString({
            pageNumber: 1,
            filters: {
              kind: ['1'],
            },
          }),
        });
      });
    });
  });

  describe('when repository has a verified publisher', () => {
    it('renders correct label', () => {
      const mockPackage = getMockPackage('10');

      render(
        <Router>
          <SearchCard package={mockPackage} />
        </Router>
      );
      expect(screen.getAllByText('Verified Publisher')).toHaveLength(1);
    });
  });

  describe('when repository has repository scanner disabled', () => {
    it('renders correct label', () => {
      const mockPackage = getMockPackage('11');

      render(
        <Router>
          <SearchCard package={mockPackage} />
        </Router>
      );
      expect(screen.getAllByText('Security scanner disabled')).toHaveLength(1);
    });
  });
});
