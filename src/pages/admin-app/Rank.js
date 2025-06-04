import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableContainer,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  Textarea,
  Badge,
  Card,
  CardBody
} from '@windmill/react-ui';
import { EditIcon, AddIcon, TrashIcon } from '../../icons/index';
import { getAllRankRule, addRankRule, updateRankRule, deleteRankRule } from '../../api/RankRuleApi';

const RankManagement = () => {
  // State for ranks
  const [ranks, setRanks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentRank, setCurrentRank] = useState({
    _id: '',
    rank: '',
    minOrderValue: 0,
    maxOrderValue: 0,
    description: '',
    color: '#000000' // Default color (black)
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rankToDelete, setRankToDelete] = useState(null);

  // Fetch ranks on component mount
  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const response = await getAllRankRule();
        setRanks(response.data); // Assuming response.data contains the array of ranks
      } catch (error) {
        console.error('Error fetching ranks:', error);
      }
    };
    fetchRanks();
  }, []);

  // Open add modal
  const openAddModal = () => {
    setModalMode('add');
    setCurrentRank({
      _id: '',
      rank: '',
      minOrderValue: 0,
      maxOrderValue: 0,
      description: '',
      color: '#000000'
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (rank) => {
    setModalMode('edit');
    setCurrentRank(rank);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRank({
      _id: '',
      rank: '',
      minOrderValue: 0,
      maxOrderValue: 0,
      description: '',
      color: '#000000'
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setCurrentRank(prev => ({
      ...prev,
      [name]: name === 'minOrderValue' || name === 'maxOrderValue'
        ? parseInt(value) || 0
        : value
    }));
  };

  // Save rank (add or update)
  const handleSave = async () => {
    try {
      if (modalMode === 'add') {
        const newRank = {
          ...currentRank,
          id: Date.now().toString(), // Temporary ID, API should return actual ID
          updatedAt: new Date().toISOString()
        };
        const response = await addRankRule(newRank);
        setRanks([...ranks, response.data]); // Assuming response.data contains the new rank
      } else {
        const updatedRank = {
          ...currentRank,
          updatedAt: new Date().toISOString()
        };
        await updateRankRule(currentRank._id, updatedRank);
        setRanks(ranks.map(rank =>
          rank._id === currentRank._id ? updatedRank : rank
        ));
      }
      closeModal();
    } catch (error) {
      console.error('Error saving rank:', error);
    }
  };

  // Handle delete
  const handleDelete = (rank) => {
    setRankToDelete(rank);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteRankRule(rankToDelete.id);
      setRanks(ranks.filter(rank => rank.id !== rankToDelete.id));
      setIsDeleteModalOpen(false);
      setRankToDelete(null);
    } catch (error) {
      console.error('Error deleting rank:', error);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null) return '...';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản Lý Hạng Thành Viên</h1>
        <p className="text-gray-600">Quản lý các hạng thành viên có trong hệ thống</p>
      </div>

      {/* Action Bar */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Badge type="primary">Tổng số: {ranks.length}</Badge>
            </div>
            <Button
              size="regular"
              onClick={openAddModal}
              className="flex items-center space-x-2"
            >
              <AddIcon className="w-4 h-4" />
              <span>Thêm hạng thành viên</span>
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="mb-6">
        <CardBody>
          <TableContainer className="mb-8">
            <Table>
              <TableHeader>
                <tr>
                  <TableCell>Hạng</TableCell>
                  <TableCell>Màu</TableCell>
                  <TableCell>Giá Trị Đơn Hàng Tối Thiểu</TableCell>
                  <TableCell>Giá Trị Đơn Hàng Tối Đa</TableCell>
                  <TableCell>Mô Tả</TableCell>
                  <TableCell>Cập Nhật Lần Cuối</TableCell>
                  <TableCell>Thao Tác</TableCell>
                </tr>
              </TableHeader>
              <TableBody>
                {ranks.map((rank) => (
                  <TableRow key={rank.id}>
                    <TableCell>
                      {/* <Badge style={{ backgroundColor: getRankBadgeColor(rank) }}> */}
                        {rank.rank}
                      {/* </Badge> */}
                    </TableCell>
                    <TableCell>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: rank.color,
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}
                      ></div>
                      <span className="ml-2">{rank.colors}</span>
                    </TableCell>
                    <TableCell>{formatCurrency(rank.minOrderValue)}</TableCell>
                    <TableCell>{formatCurrency(rank.maxOrderValue)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      <span className='text-sm'>{rank.description}</span>
                    </TableCell>
                    <TableCell>{formatDate(rank.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="small"
                          layout="outline"
                          onClick={() => openEditModal(rank)}
                        >
                          <EditIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="small"
                          layout="outline"
                          onClick={() => handleDelete(rank)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Modal Thêm/Sửa */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalHeader>
          {modalMode === 'add' ? 'Thêm Hạng Mới' : 'Chỉnh Sửa Hạng'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label>
                <span>Tên Hạng</span>
                <Input
                  className="mt-1"
                  name="rank"
                  value={currentRank.rank}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Bronze, Silver, Gold..."
                />
              </Label>
            </div>
            <div>
              <Label>
                <span>Màu Hạng</span>
                <Input
                  className="mt-1"
                  type="color"
                  name="color"
                  value={currentRank.colors}
                  onChange={handleInputChange}
                />
              </Label>
            </div>
            <div>
              <Label>
                <span>Giá Trị Đơn Hàng Tối Thiểu ($)</span>
                <Input
                  className="mt-1"
                  type="number"
                  name="minOrderValue"
                  min={0}
                  value={currentRank.minOrderValue}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </Label>
            </div>
            <div>
              <Label>
                <span>Giá Trị Đơn Hàng Tối Đa ($)</span>
                <Input
                  className="mt-1"
                  type="number"
                  name="maxOrderValue"
                  min={0}
                  value={currentRank.maxOrderValue}
                  onChange={handleInputChange}
                  placeholder="1000"
                />
              </Label>
            </div>
            <div>
              <Label>
                <span>Mô Tả</span>
                <Textarea
                  className="mt-1"
                  name="description"
                  value={currentRank.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả về hạng thành viên này..."
                  rows="3"
                />
              </Label>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={closeModal}>
              Hủy
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={handleSave}>
              {modalMode === 'add' ? 'Thêm Mới' : 'Cập Nhật'}
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={closeModal}>
              Hủy
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={handleSave}>
              {modalMode === 'add' ? 'Thêm Mới' : 'Cập Nhật'}
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Modal Xác Nhận Xóa */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalHeader>Xác Nhận Xóa</ModalHeader>
        <ModalBody>
          <p>
            Bạn có chắc chắn muốn xóa hạng <strong>{rankToDelete?.rank}</strong> không?
            Hành động này không thể hoàn tác.
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="hidden sm:block">
            <Button layout="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Hủy
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button onClick={confirmDelete}>
              Xóa
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" layout="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Hủy
            </Button>
          </div>
          <div className="block w-full sm:hidden">
            <Button block size="large" onClick={confirmDelete}>
              Xóa
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default RankManagement;