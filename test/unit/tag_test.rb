require 'test_helper'

class TagTest < ActiveSupport::TestCase
  test "needs at least a name" do
    assert_raise( ActiveRecord::RecordInvalid ) do
      f = Tag.new
      f.save!
    end
  end
end
