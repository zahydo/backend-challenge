import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../controllers/app.controller';
import { ReportService } from '../services/report.service';
import { TrackingService } from '../services/tracking.service';
import { UserService } from '../services/user.service';

describe('AppController', () => {
  let appController: AppController;
  let userService: UserService;
  let trackingService: TrackingService;
  let reportService: ReportService;

  beforeEach(async () => {
    const mockUserService = {
      users: jest.fn(),
      createUser: jest.fn(),
      user: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const mockTrackingService = {
      trackActivity: jest.fn(),
      trackReport: jest.fn(),
    };

    const mockReportService = {
      generatePdfAndReturnUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: TrackingService, useValue: mockTrackingService },
        { provide: ReportService, useValue: mockReportService },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    userService = module.get<UserService>(UserService);
    trackingService = module.get<TrackingService>(TrackingService);
    reportService = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('searchUsers', () => {
    it('should return a list of users', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
      ];
      jest.spyOn(userService, 'users').mockResolvedValue(mockUsers as any);

      const result = await appController.searchUsers('John', 0, 10, 'name');
      expect(result).toEqual(mockUsers);
      expect(userService.users).toHaveBeenCalledWith({
        skip: undefined,
        take: 10,
        orderBy: { name: 'asc' },
        where: {
          OR: [{ name: { contains: 'John' } }, { email: { contains: 'John' } }],
        },
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      };
      jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser as any);

      const result = await appController.createUser({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'USER',
      });
      expect(result).toEqual(mockUser);
      expect(userService.createUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'USER',
      });
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      };
      jest.spyOn(userService, 'user').mockResolvedValue(mockUser as any);

      const result = await appController.getUser('1');
      expect(result).toEqual(mockUser);
      expect(userService.user).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('updateUser', () => {
    it('should update a user by ID', async () => {
      const mockUser = {
        id: 1,
        name: 'John Updated',
        email: 'john.updated@example.com',
      };
      jest.spyOn(userService, 'updateUser').mockResolvedValue(mockUser as any);

      const result = await appController.updateUser('1', {
        name: 'John Updated',
        email: 'john.updated@example.com',
        role: 'ADMIN',
      });
      expect(result).toEqual(mockUser);
      expect(userService.updateUser).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'John Updated',
          email: 'john.updated@example.com',
          role: 'ADMIN',
        },
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by ID', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      };
      jest.spyOn(userService, 'deleteUser').mockResolvedValue(mockUser as any);

      const result = await appController.deleteUser('1');
      expect(result).toEqual(mockUser);
      expect(userService.deleteUser).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('createReport', () => {
    it('should generate a report and return the URL', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
      };
      const mockUrl = 'http://example.com/report.pdf';

      jest.spyOn(userService, 'user').mockResolvedValue(mockUser as any);
      jest
        .spyOn(reportService, 'generatePdfAndReturnUrl')
        .mockResolvedValue(mockUrl);
      jest.spyOn(trackingService, 'trackActivity').mockResolvedValue(null);
      jest.spyOn(trackingService, 'trackReport').mockResolvedValue(null);

      const result = await appController.createReport('1');
      expect(result).toEqual({
        message: 'Report generated successfully',
        url: mockUrl,
      });
      expect(userService.user).toHaveBeenCalledWith({ id: 1 });
      expect(reportService.generatePdfAndReturnUrl).toHaveBeenCalledWith(
        mockUser,
      );
      expect(trackingService.trackActivity).toHaveBeenCalled();
      expect(trackingService.trackReport).toHaveBeenCalled();
    });
  });
});
