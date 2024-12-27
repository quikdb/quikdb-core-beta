import * as mongoose from 'mongoose';
import { DatabaseVersion, ProjectType } from '@/@types';

type ProjectDocument = ProjectType & mongoose.Document;

const ProjectSchema: mongoose.Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: {
      type: String,
      required: true,
      ref: 'User',
    },
    code: { type: String },
    databaseVersion: { type: String, enum: Object.values(DatabaseVersion), required: true },
    isActive: { type: Boolean, required: true, default: false },
    url: { type: String, required: false, default: '' },
    canisterId: { type: String, unique: true, sparse: true },
    controllers: { type: [String], required: true, default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const ProjectModel = mongoose.model<ProjectDocument>('Project', ProjectSchema);

export { ProjectModel, ProjectDocument, ProjectSchema };
