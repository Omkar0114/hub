import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TOCEntry from './TOCEntry';

const setVisibleTOCMock = jest.fn();
const scrollIntoViewMock = jest.fn();

const defaultProps = {
  entry: {
    value: 'Installing the Chart',
    depth: 1,
  },
  level: 1,
  setVisibleTOC: setVisibleTOCMock,
  scrollIntoView: scrollIntoViewMock,
};

describe('TOCEntry', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates snapshot', () => {
    const { asFragment } = render(<TOCEntry {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  describe('Render', () => {
    it('renders properly', () => {
      render(<TOCEntry {...defaultProps} />);

      const link = screen.getByText('Installing the Chart');
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass('level1');
      expect(link).toHaveProperty('href', 'http://localhost/#installing-the-chart');
    });

    it('clicks link', async () => {
      render(<TOCEntry {...defaultProps} />);

      const link = screen.getByText('Installing the Chart');
      await userEvent.click(link);

      expect(setVisibleTOCMock).toHaveBeenCalledTimes(1);
      expect(setVisibleTOCMock).toHaveBeenCalledWith(false);
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
      expect(scrollIntoViewMock).toHaveBeenCalledWith('#installing-the-chart');
    });
  });

  describe('does not render element', () => {
    it('when value is an empty string', () => {
      const { container } = render(<TOCEntry {...defaultProps} entry={{ ...defaultProps.entry, value: '' }} />);
      expect(container).toBeEmptyDOMElement();
    });
  });
});
