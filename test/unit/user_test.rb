require 'test_helper'

class UserTest < ActiveSupport::TestCase

  test "check if all lists are deleted if user is deleted" do
    user = Factory(:user, :email => 'siebel.stefan@gmail.com')

    Factory(:list, :owner => user)
    Factory(:list, :owner => user)
    Factory(:list, :owner => user)
    
    user.destroy
    
    assert(List.where(:owner_id => user.id).count == 0)
  end
  
  test "check if all filters are deleted if user is deleted" do
    user = Factory(:user, :email => 'siebel.stefan@gmail.com')

    Factory(:filter, :user => user)
    Factory(:filter, :user => user)
    Factory(:filter, :user => user)
    
    user.destroy
    
    assert(Filter.where(:user_id => user.id).count == 0)
  end
  
  test "check if all_lists returned all lists of user plus all lists she shares with other users" do
    # create first user
    user = Factory(:user)
    share_user = Factory(:user)
    
    # create a couple of lists for user
    Factory(:list, :owner => user)
    Factory(:list, :owner => user)
    Factory(:list, :owner => user)
    
    # create a couple of lists for share_user
    Factory(:list, :owner => share_user)
    Factory(:list, :owner => share_user)
    
    user.reload
    share_user.reload
    
    # share_user shares her lists with user
    user.shared_lists = share_user.lists
    
    assert(user.all_lists.count == 5)
  end
  
  test "check if all tags can be accessed" do
    tag1 = Factory(:tag)
    tag2 = Factory(:tag)
    tag3 = Factory(:tag)
    
    list = Factory(:list)
    list.tags << tag1 << tag2 << tag3
    list.save!
    
    user = list.owner
    
    assert(user.tags.count == 3)
  end
end
