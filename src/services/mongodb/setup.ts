import { ClientNames } from '../../@types';
import { MONGO_SERVICES_CONFIG } from '../../config/servicesConfig';
import { AuthDocument, AuthSettingDocument, SettingDocument, UserDocument, BusinessDocument, ProfileDocument, AdminDocument, OtpDocument } from '../../mongodb';
import { PlaidService } from '../plaid.service';
import { createMongoService } from './factory';

/**
 * The Services class encapsulates all service instances used across the application.
 * It initializes MongoApiService instances based on predefined configurations and
 * manages their setup and teardown processes.
 */
class Services {
  // Dynamically initialize MongoApiService instances based on the configuration
  static authService = createMongoService<AuthDocument>(
    MONGO_SERVICES_CONFIG.find((s) => s.serviceName === 'authService')!
  );

  static authSettingService = createMongoService<AuthSettingDocument>(
    MONGO_SERVICES_CONFIG.find((s) => s.serviceName === 'authSettingService')!
  );

  static settingService = createMongoService<SettingDocument>(
    MONGO_SERVICES_CONFIG.find((s) => s.serviceName === 'settingService')!
  );

  static userService = createMongoService<UserDocument>(
    MONGO_SERVICES_CONFIG.find((s) => s.serviceName === 'userService')!
  );

  static businessService = createMongoService<BusinessDocument>(
    MONGO_SERVICES_CONFIG.find((s) => s.serviceName === 'businessService')!
  );

  static profileService = createMongoService<ProfileDocument>(
    MONGO_SERVICES_CONFIG.find((s) => s.serviceName === 'profileService')!
  );

  static adminService = createMongoService<AdminDocument>(
    MONGO_SERVICES_CONFIG.find((s) => s.serviceName === 'adminService')!
  );

  static otpService = createMongoService<OtpDocument>(
    MONGO_SERVICES_CONFIG.find((s) => s.serviceName === 'otpService')!
  );

  // Initialize other services separately
  static plaidService = new PlaidService(); // Adjust initialization as per PlaidService's constructor

  /**
   * Sets up all MongoApiService instances by establishing database connections and initializing models.
   */
  static async setup(clientName: ClientNames) {
    clientName === ClientNames.AUTH ? await Promise.all([
      Services.authService.setup(clientName),
      Services.authSettingService.setup(clientName),
      Services.settingService.setup(clientName),
      Services.userService.setup(clientName),
      Services.businessService.setup(clientName),
      Services.profileService.setup(clientName),
      Services.adminService.setup(clientName),
      Services.otpService.setup(clientName),
      // Initialize PlaidService if necessary
    ]) : await Promise.all([]);
     console.log(`Connected to MongoDB at ${clientName}`);
  }

  /**
   * Closes all MongoApiService instances by terminating database connections.
   */
  static async closeAll() {
    await Promise.all([
      Services.authService.close(),
      Services.authSettingService.close(),
      Services.settingService.close(),
      Services.userService.close(),
      Services.businessService.close(),
      Services.profileService.close(),
      Services.adminService.close(),
      Services.otpService.close(),
      // Close PlaidService if necessary
    ]);
    console.log(`Disconnected from MongoDB`);
  }
}

export default Services;
