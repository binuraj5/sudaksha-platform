
import { Briefcase, FileCode, Presentation, Trophy } from 'lucide-react';
import { CourseDeliverable } from '../../../types/course';

interface CourseDeliverablesProps {
    deliverables: CourseDeliverable[];
    industry?: string;
}

export function CourseDeliverables({ deliverables, industry }: CourseDeliverablesProps) {
    if (!deliverables || deliverables.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'PROJECT': return <FileCode className="w-6 h-6 text-purple-600" />;
            case 'CASE_STUDY': return <Briefcase className="w-6 h-6 text-blue-600" />;
            case 'PRESENTATION': return <Presentation className="w-6 h-6 text-orange-600" />;
            case 'CERTIFICATION': return <Trophy className="w-6 h-6 text-yellow-500" />;
            default: return <Briefcase className="w-6 h-6 text-gray-600" />;
        }
    };

    const getLabel = (type: string) => {
        // Customize label based on type/industry if needed
        return type.replace(/_/g, ' ');
    };

    return (
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
                What You Will Build & Achieve
            </h2>
            <p className="text-gray-600 mb-8 ml-11">
                Practical experience is key. Here are the key deliverables you will complete.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {deliverables.map((item, index) => (
                    <div key={index} className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex-shrink-0 mt-1">
                            <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
                                {getIcon(item.type)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-500 mb-1 tracking-wider uppercase">
                                {getLabel(item.type)}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                            {item.description && (
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
