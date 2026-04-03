import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import PageHeader from '../../components/PageHeader'
import InstructorLayout from '../../layouts/InstructorLayout'
import CoordinatorLayout from '../../layouts/CoordinatorLayout'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../components/Toast'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import api, { resolveFileUrl } from '../../utils/api'

const Assignments = () => {
  const { user } = useAuth()
  const isCoordinator = user?.role === 'COORDINATOR'
  const Layout = isCoordinator ? CoordinatorLayout : InstructorLayout
  const [searchParams] = useSearchParams()
  const [showModal, setShowModal] = useState(false)
  const [showSubmissions, setShowSubmissions] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '')
  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    totalMarks: 100
  })
  const [questionPdf, setQuestionPdf] = useState(null)
  const [error, setError] = useState('')
  const [previewFile, setPreviewFile] = useState(null)
  const [exportingAssignmentId, setExportingAssignmentId] = useState('')
  const { showToast } = useToast()
  const {
    data: assignments = [],
    loading,
    execute: executeAssignments
  } = useApi({ initialData: [], initialLoading: true })
  const {
    data: subjects = [],
    execute: executeSubjects
  } = useApi({ initialData: [] })

  useEffect(() => {
    void fetchAssignments()
  }, [selectedSubject])

  useEffect(() => {
    void fetchSubjects()
  }, [])

  const openPreview = (title, fileUrl) => {
    const resolvedUrl = resolveFileUrl(fileUrl)
    if (!resolvedUrl) {
      setError('This file preview is unavailable because the file link is invalid.')
      return
    }

    setPreviewFile({ title, url: resolvedUrl })
  }

  const fetchAssignments = async () => {
    await executeAssignments(
      () => api.get('/assignments', {
        params: selectedSubject ? { subjectId: selectedSubject } : undefined
      }),
      {
        transform: (response) => response.data.assignments
      }
    )
  }

  const fetchSubjects = async () => {
    await executeSubjects(
      () => api.get('/subjects'),
      {
        transform: (response) => response.data.subjects
      }
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!questionPdf) {
      setError('Please upload the question PDF')
      return
    }

    try {
      const payload = new FormData()
      payload.append('title', form.title)
      payload.append('description', form.description)
      payload.append('subjectId', form.subjectId)
      payload.append('dueDate', form.dueDate)
      payload.append('totalMarks', form.totalMarks)
      payload.append('questionPdf', questionPdf)

      await api.post('/assignments', payload)
      showToast({ title: 'Assignment created successfully.' })
      setShowModal(false)
      setForm({
        title: '',
        description: '',
        subjectId: selectedSubject || '',
        dueDate: '',
        totalMarks: 100
      })
      setQuestionPdf(null)
      await fetchAssignments()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleGrade = async (submissionId) => {
    try {
      const marksValue = document.getElementById(`grade-${submissionId}`)?.value
      const feedbackValue = document.getElementById(`feedback-${submissionId}`)?.value || ''

      await api.patch(`/assignments/submissions/${submissionId}/grade`, {
        obtainedMarks: parseInt(marksValue, 10),
        feedback: feedbackValue
      })

      showToast({ title: 'Submission graded successfully.' })
      if (showSubmissions) {
        const res = await api.get(`/assignments/${showSubmissions.id}`)
        setShowSubmissions(res.data.assignment)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
  }

  const handleExport = async (assignmentId, format) => {
    try {
      setExportingAssignmentId(`${assignmentId}:${format}`)
      const response = await api.get(`/assignments/${assignmentId}/export`, {
        params: { format },
        responseType: 'blob'
      })

      const contentDisposition = response.headers['content-disposition'] || ''
      const matchedName = contentDisposition.match(/filename="?(.*?)"?$/i)
      const fileName = matchedName?.[1] || `assignment-grades.${format}`
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to export assignment marks right now')
    } finally {
      setExportingAssignmentId('')
    }
  }

  const isOverdue = (dueDate) => new Date() > new Date(dueDate)

  return (
    <Layout>
      <div className="p-4 md:p-8">
        <PageHeader
          title={isCoordinator ? 'Department Assignments' : 'Module Assignments'}
          subtitle={isCoordinator ? 'Create assignments, review submissions, export marks, and send feedback across your department modules.' : 'Upload assignments for a module, review submissions, export marks, and send student feedback.'}
          breadcrumbs={[isCoordinator ? 'Coordinator' : 'Instructor', 'Modules', 'Assignments']}
          actions={[{
            label: 'Add Assignment',
            icon: Plus,
            variant: 'primary',
            onClick: () => {
              setShowModal(true)
              setError('')
              setForm((current) => ({
                ...current,
                subjectId: selectedSubject || current.subjectId
              }))
            }
          }]}
        />

        <Alert type="error" message={error} />

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <label className="mb-2 block text-sm text-gray-600">Module</label>
          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Modules</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name} - {subject.code}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading assignments..." />
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                      {isOverdue(assignment.dueDate) && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{assignment.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>📚 {assignment.subject?.name}</span>
                      <span>📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      <span>🎯 Total: {assignment.totalMarks} marks</span>
                      <span>📋 {assignment._count?.submissions} submissions</span>
                      {assignment.questionPdfUrl && (
                        <button
                          type="button"
                          onClick={() => openPreview(`${assignment.title} - Question PDF`, assignment.questionPdfUrl)}
                          className="text-green-600 font-medium hover:underline"
                        >
                          View Question PDF
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-[220px] lg:flex-col">
                    <button
                      onClick={async () => {
                        const res = await api.get(`/assignments/${assignment.id}`)
                        setShowSubmissions(res.data.assignment)
                      }}
                      className="text-xs bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100"
                    >
                      View Submissions
                    </button>
                    <button
                      onClick={() => handleExport(assignment.id, 'xlsx')}
                      className="text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-100"
                    >
                      {exportingAssignmentId === `${assignment.id}:xlsx` ? 'Exporting...' : 'Export Excel'}
                    </button>
                    <button
                      onClick={() => handleExport(assignment.id, 'pdf')}
                      className="text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200"
                    >
                      {exportingAssignmentId === `${assignment.id}:pdf` ? 'Exporting...' : 'Export PDF'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {assignments.length === 0 && (
              <EmptyState
                icon="📝"
                title="No assignments yet"
                description={isCoordinator ? 'Create the first department assignment to start collecting work.' : 'Create the first assignment for one of your modules to start collecting work.'}
              />
            )}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Add Assignment To Module" onClose={() => setShowModal(false)}>
          <Alert type="error" message={error} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Assignment Title"
              required
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <textarea
              placeholder="Description"
              required
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              required
              value={form.subjectId}
              onChange={(event) => setForm({ ...form, subjectId: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Module</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} - {subject.code}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <input
                type="datetime-local"
                required
                value={form.dueDate}
                onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Total Marks"
                value={form.totalMarks}
                onChange={(event) => setForm({ ...form, totalMarks: parseInt(event.target.value, 10) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Question PDF</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={(event) => setQuestionPdf(event.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Upload the assignment question as a PDF.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 font-medium"
              >
                Create
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showSubmissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Submissions — {showSubmissions.title}</h2>
              <button onClick={() => setShowSubmissions(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-4">
              {showSubmissions.submissions?.length === 0 && (
                <EmptyState
                  icon="📤"
                  title="No submissions yet"
                  description="Student submissions will appear here as soon as answers are uploaded."
                />
              )}

              {showSubmissions.submissions?.map((submission) => (
                <div key={submission.id} className="border rounded-xl p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{submission.student?.user?.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{submission.note || 'No note'}</p>
                      {submission.fileUrl && (
                        <button
                          type="button"
                          onClick={() => openPreview(`${submission.student?.user?.name || 'Student'} - Answer PDF`, submission.fileUrl)}
                          className="text-sm text-green-600 hover:underline mt-2 inline-block"
                        >
                          View Answer PDF
                        </button>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                        submission.status === 'GRADED'
                          ? 'bg-green-100 text-green-700'
                          : submission.status === 'LATE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                      >
                        {submission.status}
                      </span>

                      {submission.feedback && (
                        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
                          Feedback sent to student: {submission.feedback}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {submission.status === 'GRADED' ? (
                        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-right">
                          <span className="text-sm font-bold text-emerald-700">
                            {submission.obtainedMarks}/{showSubmissions.totalMarks}
                          </span>
                          <p className="mt-1 text-xs text-slate-500">Visible to instructors and coordinators only.</p>
                        </div>
                      ) : (
                        <>
                          <input
                            type="number"
                            placeholder="Marks"
                            min="0"
                            max={showSubmissions.totalMarks}
                            id={`grade-${submission.id}`}
                            className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          />
                          <textarea
                            placeholder="Feedback for student"
                            rows={3}
                            id={`feedback-${submission.id}`}
                            className="w-64 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                          />
                          <button
                            onClick={() => handleGrade(submission.id)}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-green-700"
                          >
                            Save Marks And Feedback
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">{previewFile.title}</h2>
              <div className="flex items-center gap-3">
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-green-600 hover:underline"
                >
                  Open in new tab
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={previewFile.url}
              title={previewFile.title}
              className="w-full flex-1"
              sandbox="allow-downloads"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Assignments
