import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react';
import NotFound from './NotFound';

describe('NotFound', () => {
    test('renders the correct content', () => {
        render(<NotFound />);

        const sadFaceImage = screen.getByAltText('Sad Face');
        const heading = screen.getByText('404 Not Found');
        const message = screen.getByText('Either the Resource does not exist, or you do not have the approprate permissions to access it');

        expect(sadFaceImage).toBeInTheDocument();
        expect(heading).toBeInTheDocument();
        expect(message).toBeInTheDocument();
    });
});