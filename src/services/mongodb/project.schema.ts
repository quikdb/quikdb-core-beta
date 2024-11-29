import * as mongoose from 'mongoose';
import { ProjectType, ProjectVersion } from '@/@types';

type ProjectDocument = ProjectType & mongoose.Document;

const ProjectSchema: mongoose.Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(ProjectVersion),
      required: true,
    },
    code: { type: String },
    isActive: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const ProjectModel = mongoose.model<ProjectDocument>('Project', ProjectSchema);

export { ProjectModel, ProjectDocument, ProjectSchema };
