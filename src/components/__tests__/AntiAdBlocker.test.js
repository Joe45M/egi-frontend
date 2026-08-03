import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AntiAdBlocker from '../AntiAdBlocker';
import * as adBlockDetector from '../../utils/adBlockDetector';

jest.mock('../../utils/adBlockDetector', () => {
  const original = jest.requireActual('../../utils/adBlockDetector');
  return {
    ...original,
    useAdBlockDetector: jest.fn(),
  };
});

describe('AntiAdBlocker Component', () => {
  const sampleContent = `
    <p>Paragraph 1: Intro to gaming guide.</p>
    <p>Paragraph 2: Detailed walkthrough part 1.</p>
    <p>Paragraph 3: Detailed walkthrough part 2.</p>
  `;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders full article content when adblocker is NOT active', () => {
    adBlockDetector.useAdBlockDetector.mockReturnValue({
      isAdBlockerActive: false,
      isChecking: false,
      recheckAdBlock: jest.fn(),
      dismissGracePeriod: jest.fn(),
    });

    render(<AntiAdBlocker content={sampleContent} />);

    expect(screen.getByText(/Paragraph 1: Intro to gaming guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Paragraph 2: Detailed walkthrough part 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Please Disable Your Ad Blocker/i)).not.toBeInTheDocument();
  });

  it('renders first paragraph and paywall card when adblocker IS active', () => {
    adBlockDetector.useAdBlockDetector.mockReturnValue({
      isAdBlockerActive: true,
      isChecking: false,
      recheckAdBlock: jest.fn(),
      dismissGracePeriod: jest.fn(),
    });

    render(<AntiAdBlocker content={sampleContent} />);

    expect(screen.getByText(/Paragraph 1: Intro to gaming guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Please Disable Your Ad Blocker/i)).toBeInTheDocument();
    expect(screen.getByText(/I've Disabled AdBlock/i)).toBeInTheDocument();
  });

  it('allows temporary reader pass snooze', () => {
    const dismissGracePeriod = jest.fn();
    adBlockDetector.useAdBlockDetector.mockReturnValue({
      isAdBlockerActive: true,
      isChecking: false,
      recheckAdBlock: jest.fn(),
      dismissGracePeriod,
    });

    render(<AntiAdBlocker content={sampleContent} />);

    const snoozeBtn = screen.getByText(/Temporary Reader Pass/i);
    fireEvent.click(snoozeBtn);

    expect(dismissGracePeriod).toHaveBeenCalledWith(120);
  });
});
