import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setTickets } from '../Redux_mnagement/store/slices/ticketsSlice';
import type { Ticket } from '../Redux_mnagement/store/slices/ticketsSlice';

// Mock data generator
const generateMockTickets = (): Ticket[] => {
  const mockTickets: Ticket[] = [
    {
      id: '1',
      title: 'Unable to login to the system',
      description: 'I am getting an error message when trying to log in. The error says "Invalid credentials" even though I am sure my password is correct. This started happening yesterday after the system maintenance.',
      status: 'open',
      priority: 'high',
      category: 'Technical Support',
      categoryId: '1',
      createdBy: '1',
      assignedTo: 'agent1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: ['screenshot-error.png'],
      upvotes: 3,
      downvotes: 0,
      userVote: null,
      conversations: [
        {
          id: '1',
          message: 'Thank you for reporting this issue. I can see that there was a system maintenance yesterday. Let me check if there are any known issues with the authentication system.',
          author: 'agent1',
          authorName: 'Support Agent',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isInternal: false,
        }
      ]
    },
    {
      id: '2',
      title: 'Request for new feature: Dark mode',
      description: 'It would be great if the application had a dark mode option. Many users work in low-light environments and would benefit from this feature. This would also help reduce eye strain during extended usage.',
      status: 'in-progress',
      priority: 'medium',
      category: 'Feature Request',
      categoryId: '4',
      createdBy: '2',
      assignedTo: 'agent2',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: [],
      upvotes: 12,
      downvotes: 1,
      userVote: null,
      conversations: [
        {
          id: '2',
          message: 'This is a great suggestion! We have added this to our product roadmap and will consider it for the next major release.',
          author: 'agent2',
          authorName: 'Product Manager',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isInternal: false,
        }
      ]
    },
    {
      id: '3',
      title: 'Billing discrepancy in monthly invoice',
      description: 'I noticed that my monthly invoice shows charges for services I did not use. Specifically, there are charges for premium features that I have not activated. Could you please review my account and correct this?',
      status: 'resolved',
      priority: 'urgent',
      category: 'Billing',
      categoryId: '2',
      createdBy: '3',
      assignedTo: 'agent1',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: ['invoice-march.pdf'],
      upvotes: 1,
      downvotes: 0,
      userVote: null,
      conversations: [
        {
          id: '3',
          message: 'I have reviewed your account and found the billing error. The charges have been reversed and you will see a credit on your next invoice. We apologize for the inconvenience.',
          author: 'agent1',
          authorName: 'Billing Support',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isInternal: false,
        },
        {
          id: '4',
          message: 'Thank you for the quick resolution! I can confirm that the credit appears on my account.',
          author: '3',
          authorName: 'Customer',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isInternal: false,
        }
      ]
    },
    {
      id: '4',
      title: 'Application crashes when uploading large files',
      description: 'The application consistently crashes when I try to upload files larger than 50MB. This is preventing me from completing my work. The error occurs immediately after selecting the file.',
      status: 'open',
      priority: 'high',
      category: 'Bug Report',
      categoryId: '5',
      createdBy: '4',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: ['error-log.txt'],
      upvotes: 5,
      downvotes: 0,
      userVote: null,
      conversations: []
    },
    {
      id: '5',
      title: 'How to reset my password?',
      description: 'I forgot my password and cannot find the reset password link on the login page. Could you please guide me through the password reset process?',
      status: 'closed',
      priority: 'low',
      category: 'General Inquiry',
      categoryId: '3',
      createdBy: '5',
      assignedTo: 'agent3',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      attachments: [],
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      conversations: [
        {
          id: '5',
          message: 'You can reset your password by clicking on "Forgot Password?" link on the login page. If you don\'t see it, please clear your browser cache and try again.',
          author: 'agent3',
          authorName: 'Support Agent',
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          isInternal: false,
        },
        {
          id: '6',
          message: 'Perfect! I found the link and was able to reset my password. Thank you!',
          author: '5',
          authorName: 'Customer',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          isInternal: false,
        }
      ]
    }
  ];

  return mockTickets;
};

export const useTickets = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Simulate loading tickets from API
    const loadTickets = async () => {
      try {
        // In a real app, this would be an API call
        const tickets = generateMockTickets();
        dispatch(setTickets(tickets));
      } catch (error) {
        console.error('Failed to load tickets:', error);
      }
    };

    loadTickets();
  }, [dispatch]);
};