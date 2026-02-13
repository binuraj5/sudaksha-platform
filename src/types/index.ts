export interface Course {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  trainerId: string;
  trainer?: Trainer;
  batches?: Batch[];
  reviews?: Review[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  bio: string;
  expertise: string[];
  experience: number;
  imageUrl?: string;
  courses?: Course[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Batch {
  id: string;
  name: string;
  courseId: string;
  course?: Course;
  startDate: Date;
  endDate: Date;
  schedule: string;
  maxStudents: number;
  currentStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  courseId: string;
  course?: Course;
  studentName: string;
  studentEmail: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
